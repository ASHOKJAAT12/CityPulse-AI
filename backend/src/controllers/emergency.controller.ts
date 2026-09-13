import { Request, Response, NextFunction } from 'express';
import { EmergencyService } from '../services/emergency/EmergencyService';
import { createEmergencySchema, updateEmergencySchema, verifyEmergencySchema, assignTeamSchema, updateStatusSchema } from '../validators/emergency.validator';
import { emitToCityRoom } from '../websocket';

export class EmergencyController {

    // ─── CRUD EMERGENCY ───────────────────────────────────────────────────

    static async getEmergencies(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 50;
            const page = parseInt(req.query['page'] as string) || 1;

            // Build query
            const query: any = {};
            if (req.query['status']) query.status = req.query['status'];
            if (req.query['priority']) query.priority = req.query['priority'];
            if (req.query['severity']) query.severity = req.query['severity'];
            if (req.query['publicVisibility'] !== undefined) query.publicVisibility = req.query['publicVisibility'] === 'true';

            const result = await EmergencyService.getEmergencies(cityId, query, limit, page);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getEmergency(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const emergency = await EmergencyService.getEmergencyById(cityId, req.params['id']);
            res.status(200).json({ status: 'success', data: emergency });
        } catch (error) {
            next(error);
        }
    }

    static async createEmergency(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createEmergencySchema.parse(req.body);

            const emergency = await EmergencyService.createEmergency(cityId, req.user!.id, validated);

            // Real-time broadcast
            emitToCityRoom(cityId.toString(), 'emergency:created', { emergency });

            res.status(201).json({ status: 'success', data: emergency });
        } catch (error) {
            next(error);
        }
    }

    static async updateEmergency(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateEmergencySchema.parse(req.body);
            const emergency = await EmergencyService.updateEmergency(cityId, req.params['id'], req.user!.id, validated);

            emitToCityRoom(cityId.toString(), 'emergency:updated', { emergency });

            res.status(200).json({ status: 'success', data: emergency });
        } catch (error) {
            next(error);
        }
    }

    // ─── WORKFLOW & DISPATCH ──────────────────────────────────────────────

    static async verifyEmergency(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = verifyEmergencySchema.parse(req.body);
            const emergency = await EmergencyService.verifyEmergency(cityId, req.params['id'], req.user!.id, validated.action, validated.notes);

            emitToCityRoom(cityId.toString(), 'emergency:verified', { emergency });

            res.status(200).json({ status: 'success', data: emergency });
        } catch (error) {
            next(error);
        }
    }

    static async assignTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = assignTeamSchema.parse(req.body);
            const assignment = await EmergencyService.assignTeam(cityId, req.params['id'], req.user!.id, validated);

            // Also need to broadcast the emergency update since its status might have changed to DISPATCHING
            const emergency = await EmergencyService.getEmergencyById(cityId, req.params['id']);
            emitToCityRoom(cityId.toString(), 'emergency:assigned', { emergency, assignment });

            res.status(200).json({ status: 'success', data: assignment });
        } catch (error) {
            next(error);
        }
    }

    static async dispatchTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const assignment = await EmergencyService.dispatchTeam(cityId, req.params['id'], req.user!.id, req.body.assignmentId);

            const emergency = await EmergencyService.getEmergencyById(cityId, req.params['id']);
            emitToCityRoom(cityId.toString(), 'emergency:dispatched', { emergency, assignment });

            res.status(200).json({ status: 'success', data: assignment });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateStatusSchema.parse(req.body);
            const emergency = await EmergencyService.updateStatus(cityId, req.params['id'], req.user!.id, validated.status, validated.notes);

            const eventType = validated.status === 'RESOLVED' ? 'emergency:resolved' : validated.status === 'CLOSED' ? 'emergency:closed' : 'emergency:status-changed';
            emitToCityRoom(cityId.toString(), eventType, { emergency });

            res.status(200).json({ status: 'success', data: emergency });
        } catch (error) {
            next(error);
        }
    }

    // ─── TIMELINE ─────────────────────────────────────────────────────────

    static async getTimeline(req: Request, res: Response, next: NextFunction) {
        // Can be separated into EmergencyService.getTimeline if needed
        try {
            const { EmergencyTimeline } = await import('../models');
            const cityId = req.user?.cityId || req.params['cityId'];
            const timeline = await EmergencyTimeline.find({ emergencyId: req.params['id'], cityId }).sort({ createdAt: 1 });
            res.status(200).json({ status: 'success', data: timeline });
        } catch (error) {
            next(error);
        }
    }
}
