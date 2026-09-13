import { Types } from 'mongoose';
import { EmergencyIncident, ResponseTeam, EmergencyResource, EmergencyAssignment, EmergencyTimeline, EmergencyCorrelation } from '../../models';
import { notificationService, NotificationAudience } from '../notification/NotificationService';
import { intelligenceBus } from '../intelligence/IntelligenceEventEmitter';
import { AppError, ErrorCode } from '../../utils/AppError';

export class EmergencyService {
    /**
     * Generates a unique emergency number like EMG-YYYY-XXXXXX
     */
    private static async generateEmergencyNumber(cityId: string | Types.ObjectId): Promise<string> {
        const year = new Date().getFullYear();
        // Count documents in the current year for this city to generate sequential number
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year + 1, 0, 1);

        const count = await EmergencyIncident.countDocuments({
            cityId,
            createdAt: { $gte: startOfYear, $lt: endOfYear }
        });

        const sequence = (count + 1).toString().padStart(6, '0');
        return `EMG-${year}-${sequence}`;
    }

    /**
     * Creates a timeline event
     */
    static async addTimelineEvent(
        emergencyId: string | Types.ObjectId,
        cityId: string | Types.ObjectId,
        eventType: string,
        message: string,
        actorType: 'USER' | 'SYSTEM' | 'AI',
        actorId?: string | Types.ObjectId,
        visibleToCitizen = false,
        metadata?: any
    ) {
        await EmergencyTimeline.create({
            emergencyId,
            cityId,
            eventType,
            message,
            actorType,
            actorId,
            visibleToCitizen,
            metadata
        });
    }

    // ─── EMERGENCY INCIDENT CRUD ─────────────────────────────────────────────

    static async getEmergencies(cityId: string | Types.ObjectId, query: any, limit: number, page: number) {
        const skip = (page - 1) * limit;
        const filter = { cityId, ...query };

        const [emergencies, total] = await Promise.all([
            EmergencyIncident.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('reportedBy', 'name email')
                .populate('incidentCommander', 'name')
                .populate('assignedDepartment', 'name')
                .populate('currentTeam', 'name teamCode type'),
            EmergencyIncident.countDocuments(filter)
        ]);

        return { emergencies, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    static async getEmergencyById(cityId: string | Types.ObjectId, id: string) {
        const emergency = await EmergencyIncident.findOne({ _id: id, cityId })
            .populate('reportedBy', 'name email')
            .populate('incidentCommander', 'name')
            .populate('assignedDepartment', 'name')
            .populate('currentTeam', 'name teamCode type');

        if (!emergency) {
            throw new AppError('Emergency not found', 404, ErrorCode.NOT_FOUND);
        }
        return emergency;
    }

    static async createEmergency(cityId: string | Types.ObjectId, userId: string | Types.ObjectId, data: any) {
        // Potential logic for duplicate prevention
        // Could check for recent emergencies of similar type/location here (skipping for brevity but foundation is Correlation)

        const emergencyNumber = await this.generateEmergencyNumber(cityId);

        const emergency = new EmergencyIncident({
            ...data,
            cityId,
            emergencyNumber,
            status: 'REPORTED',
            reportedBy: userId
        });

        await emergency.save();

        await this.addTimelineEvent(
            emergency._id,
            cityId,
            'CREATED',
            `Emergency ${emergencyNumber} reported via ${data.sourceType}`,
            'USER',
            userId,
            data.publicVisibility || false,
            { sourceType: data.sourceType, sourceId: data.sourceId }
        );

        await EmergencyCorrelation.create({
            emergencyId: emergency._id,
            cityId,
            sourceType: data.sourceType,
            sourceId: data.sourceId,
            relation: 'CAUSED_BY',
            confidence: 1.0
        });

        // Notify city admins if it's a HIGH or CRITICAL severity emergency
        if (['HIGH', 'CRITICAL'].includes(data.severity)) {
            await notificationService.send({
                cityId,
                audience: NotificationAudience.ROLE,
                role: 'CITY_ADMIN',
                category: 'SYSTEM',
                priority: data.severity as 'CRITICAL' | 'HIGH',
                title: `Critical Emergency Reported: ${emergencyNumber}`,
                message: `${data.title} - Requires immediate verification.`,
                referenceType: 'EMERGENCY',
                referenceId: emergency._id
            });
        }

        // Emit to AI for recommendations
        intelligenceBus.emit('emergency:created', emergency);

        return emergency;
    }

    static async updateEmergency(cityId: string | Types.ObjectId, id: string, userId: string | Types.ObjectId, data: any) {
        const emergency = await EmergencyIncident.findOneAndUpdate(
            { _id: id, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!emergency) {
            throw new AppError('Emergency not found', 404, ErrorCode.NOT_FOUND);
        }

        await this.addTimelineEvent(
            emergency._id,
            cityId,
            'UPDATE',
            'Emergency details updated',
            'USER',
            userId
        );

        return emergency;
    }

    // ─── STATUS TRANSITIONS & DISPATCH ────────────────────────────────────────

    static async verifyEmergency(cityId: string | Types.ObjectId, id: string, userId: string | Types.ObjectId, action: string, notes?: string) {
        const emergency = await this.getEmergencyById(cityId, id);

        if (emergency.status !== 'REPORTED') {
            throw new AppError('Only REPORTED emergencies can be verified', 400, ErrorCode.VALIDATION_ERROR);
        }

        let newStatus: any = emergency.status;
        if (action === 'VERIFY') newStatus = 'VERIFIED';
        else if (action === 'MARK_FALSE_ALARM') newStatus = 'FALSE_ALARM';
        // REQUEST_MORE_INFORMATION means keeping it REPORTED or maybe entering a new state

        emergency.status = newStatus;
        if (newStatus === 'FALSE_ALARM') {
            emergency.closedAt = new Date();
        }

        await emergency.save();

        await this.addTimelineEvent(
            emergency._id,
            cityId,
            newStatus,
            notes || `Emergency verification action: ${action}`,
            'USER',
            userId
        );

        if (newStatus === 'VERIFIED') {
            await notificationService.send({
                cityId,
                audience: NotificationAudience.ROLE,
                role: 'CITY_ADMIN',
                category: 'SYSTEM',
                priority: emergency.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
                title: `Emergency Verified: ${emergency.emergencyNumber}`,
                message: `${emergency.title} has been verified. Dispatch is now available.`,
                referenceType: 'EMERGENCY',
                referenceId: emergency._id
            });
        }

        // Broadcast to WebSocket and/or notifications in controller
        return emergency;

    }

    static async updateStatus(cityId: string | Types.ObjectId, id: string, userId: string | Types.ObjectId, newStatus: string, notes?: string) {
        const emergency = await this.getEmergencyById(cityId, id);

        // Basic centralized validation of transitions
        const validStates = ['REPORTED', 'VERIFIED', 'ACKNOWLEDGED', 'DISPATCHING', 'RESPONSE_IN_PROGRESS', 'CONTAINED', 'RESOLVED', 'CLOSED', 'FALSE_ALARM', 'CANCELLED'];
        if (!validStates.includes(newStatus)) {
            throw new AppError('Invalid status', 400, ErrorCode.VALIDATION_ERROR);
        }

        // Cannot revert to REPORTED if it's already further down the workflow
        const currentStateIndex = validStates.indexOf(emergency.status);
        const newStateIndex = validStates.indexOf(newStatus);

        // Prevent going backward generally (with exceptions like moving back to DISPATCHING if a team cancels)
        // For Phase 14, keep it simple but enforce terminal states
        const terminalStates = ['CLOSED', 'FALSE_ALARM', 'CANCELLED'];
        if (terminalStates.includes(emergency.status) && newStatus !== emergency.status) {
            throw new AppError('Cannot change status of a terminal emergency', 400, ErrorCode.VALIDATION_ERROR);
        }

        emergency.status = newStatus as any;
        if (newStatus === 'RESOLVED') {
            emergency.resolvedAt = new Date();
        } else if (newStatus === 'CLOSED') {
            emergency.closedAt = new Date();
            // TODO: Free resources & teams in the assignment? Better done explicitly in "closeAssignment"
        }

        await emergency.save();

        await this.addTimelineEvent(
            emergency._id,
            cityId,
            'STATUS_CHANGE',
            notes || `Status changed from ${validStates[currentStateIndex]} to ${newStatus}`,
            'USER',
            userId
        );

        if (newStatus === 'RESOLVED') {
            await notificationService.send({
                cityId,
                audience: NotificationAudience.ROLE,
                role: 'CITY_ADMIN',
                category: 'SYSTEM',
                priority: 'INFO',
                title: `Emergency Resolved: ${emergency.emergencyNumber}`,
                message: `${emergency.title} has been marked as resolved.`,
                referenceType: 'EMERGENCY',
                referenceId: emergency._id
            });
        }

        return emergency;
    }

    static async assignTeam(cityId: string | Types.ObjectId, id: string, userId: string | Types.ObjectId, data: { departmentId: string, teamId: string, resourceIds?: string[], notes?: string }) {
        const emergency = await this.getEmergencyById(cityId, id);

        // Validation - only VERIFIED, ACKNOWLEDGED, or DISPATCHING should be assigned teams
        if (!['VERIFIED', 'ACKNOWLEDGED', 'DISPATCHING', 'RESPONSE_IN_PROGRESS'].includes(emergency.status)) {
            throw new AppError('Cannot assign team in current status', 400, ErrorCode.VALIDATION_ERROR);
        }

        // Verify team exists and is available
        const team = await ResponseTeam.findOne({ _id: data.teamId, cityId });
        if (!team) throw new AppError('Team not found or unauthorized', 404, ErrorCode.NOT_FOUND);

        if (team.status !== 'AVAILABLE') {
            throw new AppError('Team is not available for assignment', 400, ErrorCode.VALIDATION_ERROR);
        }

        // Transactions should be used here if MongoDB cluster supports it. We'll sequence the writes safely.
        team.status = 'ASSIGNED';
        await team.save();

        // Check resources 
        if (data.resourceIds && data.resourceIds.length > 0) {
            for (const rid of data.resourceIds) {
                const resource = await EmergencyResource.findOne({ _id: rid, cityId });
                if (!resource || resource.status !== 'AVAILABLE' || resource.availableQuantity <= 0) {
                    throw new AppError(`Resource ${rid} is unavailable`, 400, ErrorCode.VALIDATION_ERROR);
                }
                resource.status = 'RESERVED';
                resource.assignedEmergencyId = emergency._id;
                await resource.save();
            }
        }

        const assignment = await EmergencyAssignment.create({
            emergencyId: emergency._id,
            cityId,
            department: data.departmentId,
            teamId: data.teamId,
            resourceIds: data.resourceIds || [],
            assignedBy: userId,
            notes: data.notes
        });

        emergency.assignedDepartment = team.department;
        emergency.currentTeam = team._id;
        if (['VERIFIED', 'ACKNOWLEDGED'].includes(emergency.status)) {
            emergency.status = 'DISPATCHING';
        }
        await emergency.save();

        await this.addTimelineEvent(
            emergency._id,
            cityId,
            'TEAM_ASSIGNED',
            `Team ${team.name} assigned to emergency`,
            'USER',
            userId,
            false,
            { teamId: team._id, assignmentId: assignment._id }
        );

        return assignment;
    }

    static async dispatchTeam(cityId: string | Types.ObjectId, id: string, userId: string | Types.ObjectId, assignmentId: string) {
        const assignment = await EmergencyAssignment.findOne({ _id: assignmentId, cityId, emergencyId: id });
        if (!assignment) throw new AppError('Assignment not found', 404, ErrorCode.NOT_FOUND);

        if (assignment.status !== 'ASSIGNED' && assignment.status !== 'ACCEPTED') {
            throw new AppError('Can only dispatch assigned or accepted teams', 400, ErrorCode.VALIDATION_ERROR);
        }

        const team = await ResponseTeam.findOne({ _id: assignment.teamId });
        if (team) {
            team.status = 'RESPONDING';
            await team.save();
        }

        // Update resources to DEPLOYED
        if (assignment.resourceIds && assignment.resourceIds.length > 0) {
            for (const rid of assignment.resourceIds) {
                await EmergencyResource.updateOne(
                    { _id: rid },
                    { $set: { status: 'DEPLOYED' } }
                );
            }
        }

        assignment.status = 'EN_ROUTE';
        assignment.startedAt = new Date();
        await assignment.save();

        const emergency = await EmergencyIncident.findOne({ _id: id });
        if (emergency) {
            emergency.status = 'RESPONSE_IN_PROGRESS';
            emergency.dispatchedAt = new Date();
            await emergency.save();

            await this.addTimelineEvent(
                emergency._id,
                cityId,
                'DISPATCHED',
                `Team dispatched to the scene`,
                'USER',
                userId,
                true // Maybe visible to citizens to know help is on the way
            );
        }

        return assignment;
    }

    static async escalateOverdueEmergencies() {
        const threshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes unverified
        const overdue = await EmergencyIncident.find({
            status: 'REPORTED',
            severity: { $in: ['HIGH', 'CRITICAL'] },
            createdAt: { $lt: threshold }
        });

        for (const emergency of overdue) {
            await notificationService.send({
                cityId: emergency.cityId.toString(),
                audience: NotificationAudience.ROLE,
                role: 'SUPER_ADMIN',
                category: 'SYSTEM',
                priority: 'CRITICAL',
                title: `ESCALATION: Unverified Critical Emergency`,
                message: `Emergency ${emergency.emergencyNumber} has been unverified for over 30 minutes. immediate attention required.`,
                referenceType: 'EMERGENCY',
                referenceId: emergency._id
            });
            await this.addTimelineEvent(
                emergency._id,
                emergency.cityId,
                'ESCALATED',
                'Emergency automatically escalated to SUPER_ADMIN due to SLA breach',
                'SYSTEM'
            );
        }
    }
}
