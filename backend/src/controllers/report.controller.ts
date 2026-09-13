import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reports/ReportService';
import { DepartmentService } from '../services/reports/DepartmentService';
import { IAttachment } from '../models';

export class ReportController {

    static async submitReport(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId;
            const citizenId = (req as any).user.id;

            // Handle multer payload mapping
            const files = req.files as Express.Multer.File[] || [];
            const attachments: IAttachment[] = files.map(f => ({
                url: `/uploads/${f.filename}`,
                fileType: f.mimetype,
                size: f.size,
                uploadedAt: new Date()
            }));

            const report = await ReportService.createReport(cityId, citizenId, req.body, attachments);
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    static async getMyReports(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId;
            const citizenId = (req as any).user.id;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const filters = { citizenId, ...req.query };

            const result = await ReportService.getReports(cityId, filters, { page, limit });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async getAdminReports(req: Request, res: Response, next: NextFunction) {
        try {
            // Safe checking mapping
            const cityId = (req as any).user.cityId === null ? req.query.cityId as string : (req as any).user.cityId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const result = await ReportService.getReports(cityId, req.query, { page, limit });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async getReportDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId === null ? req.query.cityId as string : (req as any).user.cityId;
            const reportId = req.params.id;

            const details = await ReportService.getReportDetails(cityId, reportId);

            // Mask internal tracking logic if accessed by citizen
            if ((req as any).user.role === 'CITIZEN') {
                details.timeline = details.timeline.filter((t: any) => t.visibleToCitizen);
                details.comments = details.comments.filter((c: any) => c.visibleToCitizen);
            }

            res.status(200).json({ success: true, data: details });
        } catch (error) {
            next(error);
        }
    }

    static async updateReportAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId === null ? req.body.cityId : (req as any).user.cityId;
            const reportId = req.params.id;

            const report = await ReportService.updateReportStatus(cityId, reportId, req.body, (req as any).user);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    static async addComment(req: Request, res: Response, next: NextFunction) {
        try {
            // Users and Admins can both comment. Handle scope.
            const cityId = (req as any).user.cityId === null ? req.body.cityId : (req as any).user.cityId;
            const reportId = req.params.id;
            const authorRole = (req as any).user.role;
            const authorId = (req as any).user.id;

            // Citizens default false for visibility is weird. We force it true if they are citizens.
            const visibleToCitizen = authorRole === 'CITIZEN' ? true : req.body.visibleToCitizen !== false;

            const comment = await ReportService.addComment(cityId, reportId, authorId, authorRole, req.body.message, visibleToCitizen);
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            next(error);
        }
    }
}
