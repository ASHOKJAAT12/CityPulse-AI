import { Types } from 'mongoose';
import { intelligenceBus } from '../intelligence/IntelligenceEventEmitter';
import { CitizenReport, CitizenReportTimeline, CitizenReportComment, IAttachment } from '../../models';
import { DepartmentService } from './DepartmentService';
import { emitToCityRoom } from '../../websocket';
import { AppError } from '../../utils/AppError';
import { notificationService, NotificationAudience } from '../notification/NotificationService';
import { GeminiReportIntelligence } from '../intelligence/GeminiReportIntelligence';

export class ReportService {
    static generateReportNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `SC360-${new Date().getFullYear()}-${result}`;
    }

    static async createReport(
        cityId: string,
        citizenId: string,
        data: any,
        attachments: IAttachment[]
    ) {
        // Automatically detect category and severity with AI
        if (!data.category || !data.severity || !data.subcategory) {
            const aiData = await GeminiReportIntelligence.analyzeReport(data.title, data.description);
            if (aiData) {
                data.category = data.category || aiData.category;
                data.subcategory = data.subcategory || aiData.subcategory;
                data.severity = data.severity || aiData.severity;
            } else if (!data.category || !data.subcategory) {
                // Fallback to avoid breaking schema if AI fails and no payload provided
                data.category = data.category || 'General';
                data.subcategory = data.subcategory || 'Other';
            }
        }

        // Find possible duplicate before insertion limits processing overhead
        const nearbyPossibleDuplicates = await CitizenReport.find({
            cityId: new Types.ObjectId(cityId),
            category: data.category,
            status: { $nin: ['CLOSED', 'REJECTED', 'RESOLVED'] },
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [data.longitude, data.latitude] },
                    $maxDistance: 100 // within 100 meters
                }
            }
        }).limit(1);

        const isDuplicate = nearbyPossibleDuplicates.length > 0;

        // Auto assign department if mapped
        const mappedDept = await DepartmentService.findDepartmentForCategory(cityId, data.category);

        const reportNumber = this.generateReportNumber();
        const report = new CitizenReport({
            cityId: new Types.ObjectId(cityId),
            reportNumber,
            citizenId: new Types.ObjectId(citizenId),
            category: data.category,
            subcategory: data.subcategory,
            title: data.title,
            description: data.description,
            location: {
                type: 'Point',
                coordinates: [data.longitude, data.latitude]
            },
            address: data.address,
            attachments,
            severity: data.severity,
            source: data.source,
            relatedAssetType: data.relatedAssetType,
            relatedAssetId: data.relatedAssetId ? new Types.ObjectId(data.relatedAssetId) : undefined,
            department: mappedDept ? mappedDept._id : undefined,
            // Flag review logic based on duplication tests
            priority: isDuplicate ? 'LOW' : data.severity || 'MEDIUM', // Simple priority logic mapping
        });

        if (isDuplicate) {
            report.duplicateOf = nearbyPossibleDuplicates[0]._id;
        }

        await report.save();

        await CitizenReportTimeline.create({
            reportId: report._id,
            cityId: report.cityId,
            status: 'SUBMITTED',
            message: 'Report submitted by citizen.',
            visibleToCitizen: true,
            actorType: 'CITIZEN',
            actorId: new Types.ObjectId(citizenId)
        });

        // WS Emit Admin Only
        emitToCityRoom(cityId, 'citizen-report-created', {
            reportId: report._id,
            reportNumber: report.reportNumber,
            category: report.category,
            isDuplicate
        });

        intelligenceBus.emit('report:created', report);

        return report;
    }

    static async getReports(cityId: string, queryFilters: any, pagination: { page: number; limit: number }) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const filters: any = { cityId: new Types.ObjectId(cityId) };
        if (queryFilters.status) filters.status = queryFilters.status;
        if (queryFilters.category) filters.category = queryFilters.category;
        if (queryFilters.priority) filters.priority = queryFilters.priority;
        if (queryFilters.department) filters.department = new Types.ObjectId(queryFilters.department);
        if (queryFilters.citizenId) filters.citizenId = new Types.ObjectId(queryFilters.citizenId);

        const [reports, total] = await Promise.all([
            CitizenReport.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('department', 'name code')
                .lean(),
            CitizenReport.countDocuments(filters)
        ]);

        return {
            data: reports,
            meta: {
                page, limit, total, totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getReportDetails(cityId: string, reportId: string) {
        const report = await CitizenReport.findOne({ _id: new Types.ObjectId(reportId), cityId: new Types.ObjectId(cityId) })
            .populate('department', 'name code')
            .populate('assignedTo', 'name email role')
            .lean();

        if (!report) throw AppError.notFound('Report not found');

        const [timeline, comments] = await Promise.all([
            CitizenReportTimeline.find({ reportId: report._id }).sort({ createdAt: 1 }).lean(),
            CitizenReportComment.find({ reportId: report._id }).sort({ createdAt: 1 }).populate('authorId', 'name role').lean()
        ]);

        return { report, timeline, comments };
    }

    static async updateReportStatus(
        cityId: string,
        reportId: string,
        payload: any,
        actor: { id: string; role: string }
    ) {
        const report = await CitizenReport.findOne({ _id: new Types.ObjectId(reportId), cityId: new Types.ObjectId(cityId) });
        if (!report) throw AppError.notFound('Report not found');

        const oldStatus = report.status;
        const newStatus = payload.status || oldStatus;

        // Apply updates
        if (payload.status) report.status = payload.status;
        if (payload.priority) report.priority = payload.priority;
        if (payload.department) report.department = new Types.ObjectId(payload.department);
        if (payload.assignedTo) report.assignedTo = new Types.ObjectId(payload.assignedTo);
        if (payload.verificationStatus) report.verificationStatus = payload.verificationStatus;
        if (payload.resolution) report.resolution = payload.resolution;

        if (['CLOSED', 'REJECTED', 'RESOLVED'].includes(newStatus) && !['CLOSED', 'REJECTED', 'RESOLVED'].includes(oldStatus)) {
            report.closedAt = new Date();
        }

        await report.save();

        // Create timeline if status changed
        if (newStatus !== oldStatus) {
            await CitizenReportTimeline.create({
                reportId: report._id,
                cityId: report.cityId,
                status: newStatus,
                message: `Status transitioned from ${oldStatus} to ${newStatus}.`,
                visibleToCitizen: true,
                actorType: actor.role as any,
                actorId: new Types.ObjectId(actor.id)
            });

            emitToCityRoom(cityId, 'citizen-report-status-changed', {
                reportId: report._id,
                reportNumber: report.reportNumber,
                status: newStatus
            });

            // Dispatch notification to user
            await notificationService.send({
                cityId: report.cityId.toString(),
                audience: NotificationAudience.USER,
                userId: report.citizenId.toString(),
                category: 'CITIZEN_REPORT',
                priority: 'INFO',
                title: `Report Status: ${newStatus}`,
                message: `Your report ${report.reportNumber} has transitioned to ${newStatus}.`,
                referenceType: 'CITIZEN_REPORT',
                referenceId: report._id.toString()
            });
        }

        return report;
    }

    static async addComment(cityId: string, reportId: string, authorId: string, authorRole: string, message: string, visibleToCitizen: boolean = true) {
        const report = await CitizenReport.exists({ _id: new Types.ObjectId(reportId), cityId: new Types.ObjectId(cityId) });
        if (!report) throw AppError.notFound('Report not found');

        const comment = await CitizenReportComment.create({
            reportId: new Types.ObjectId(reportId),
            cityId: new Types.ObjectId(cityId),
            authorId: new Types.ObjectId(authorId),
            authorRole,
            message,
            visibleToCitizen
        });

        emitToCityRoom(cityId, 'citizen-report-comment-added', {
            reportId,
            actorRole: authorRole
        });

        // Notify user about admin comment
        if (authorRole !== 'CITIZEN' && visibleToCitizen) {
            const reportDoc = await CitizenReport.findById(reportId).lean();
            if (reportDoc) {
                await notificationService.send({
                    cityId: cityId,
                    audience: NotificationAudience.USER,
                    userId: reportDoc.citizenId.toString(),
                    category: 'CITIZEN_REPORT',
                    priority: 'INFO',
                    title: `New Comment on Report`,
                    message: `An official has commented on your report: ${message.substring(0, 50)}...`,
                    referenceType: 'CITIZEN_REPORT',
                    referenceId: reportId
                });
            }
        }

        return comment;
    }
}
