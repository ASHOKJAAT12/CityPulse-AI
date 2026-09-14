import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import {
    OptimizationRecommendation,
    OptimizationScenario,
    MaintenancePlan
} from '../../models';
import { CapacityEngine } from '../../services/optimization/CapacityEngine';
import { OptimizationRecommendationEngine } from '../../services/optimization/OptimizationRecommendationEngine';

export interface AdminRequest extends Request {
    adminCityId?: string;
    user?: any;
}

export class OptimizationController {

    /**
     * @route GET /api/v1/optimization/capacity
     * Retrieve live deterministic infrastructure capacity for UI overview.
     */
    static async getCityCapacity(req: AdminRequest, res: Response) {
        if (!req.adminCityId) throw AppError.forbidden('City context required');

        const capacity = await CapacityEngine.getCityCapacityBaselines(req.adminCityId.toString());
        res.json({ success: true, data: capacity });
    }

    /**
     * @route GET /api/v1/optimization/recommendations
     */
    static async getRecommendations(req: AdminRequest, res: Response) {
        if (!req.adminCityId) throw AppError.forbidden('City context required');

        const { status, service } = req.query;
        let query: any = { cityId: req.adminCityId };

        if (status) query.status = status;
        if (service) query.service = service;

        const recs = await OptimizationRecommendation.find(query).sort({ createdAt: -1 });

        // Trigger passive evaluation natively so dashboard feels "alive" (limited bounded invocation)
        // Usually, this should be invoked by a cron job, but we'll do lightweight fetch.
        if (recs.length < 5) {
            await OptimizationRecommendationEngine.generateCrossServiceRecommendations(req.adminCityId.toString(), req.user.id.toString());
        }

        const freshRecs = await OptimizationRecommendation.find(query).sort({ createdAt: -1 });

        res.json({ success: true, count: freshRecs.length, data: freshRecs });
    }

    /**
     * @route GET /api/v1/optimization/recommendations/:id
     */
    static async getRecommendation(req: AdminRequest, res: Response) {
        const rec = await OptimizationRecommendation.findOne({
            _id: req.params.id,
            cityId: req.adminCityId
        });

        if (!rec) throw AppError.notFound('Recommendation not found');

        res.json({ success: true, data: rec });
    }

    /**
     * @route POST /api/v1/optimization/recommendations/:id/accept
     */
    static async acceptRecommendation(req: AdminRequest, res: Response) {
        const rec = await OptimizationRecommendation.findOne({
            _id: req.params.id,
            cityId: req.adminCityId
        });

        if (!rec) throw AppError.notFound('Recommendation not found');

        rec.status = 'ACCEPTED';
        rec.reviewedBy = req.user.id;
        rec.reviewedAt = new Date();
        await rec.save();

        res.json({ success: true, data: rec });
    }

    /**
     * @route POST /api/v1/optimization/recommendations/:id/apply
     */
    static async applyRecommendation(req: AdminRequest, res: Response) {
        const rec = await OptimizationRecommendation.findOne({
            _id: req.params.id,
            cityId: req.adminCityId
        });

        if (!rec) throw AppError.notFound('Recommendation not found');

        if (rec.status !== 'ACCEPTED') {
            throw AppError.badRequest('Recommendation must be ACCEPTED prior to being APPLIED.');
        }

        rec.status = 'APPLIED';
        rec.appliedAt = new Date();

        // At this specific point, true system mutations would cascade using safe wrappers.
        // e.g. GarbageVehicle.updateOne({ ... }, { status: 'ON_ROUTE' })

        await rec.save();
        res.json({ success: true, message: 'Plan executed successfully', data: rec });
    }

    /**
     * Scenarios
     */
    static async getScenarios(req: AdminRequest, res: Response) {
        const scenarios = await OptimizationScenario.find({ cityId: req.adminCityId }).sort({ createdAt: -1 });
        res.json({ success: true, data: scenarios });
    }

    static async createScenario(req: AdminRequest, res: Response) {
        if (!req.adminCityId) throw AppError.forbidden('City context required');

        const scenario = await OptimizationScenario.create({
            cityId: req.adminCityId,
            name: req.body.name || 'Custom Simulation',
            scenarioType: req.body.scenarioType || 'CUSTOM',
            inputs: req.body.inputs,
            objective: req.body.objective || 'GENERAL_ANALYSIS',
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: scenario });
    }

    static async runScenarioSimulation(req: AdminRequest, res: Response) {
        const scenario = await OptimizationScenario.findOne({
            _id: req.params.id,
            cityId: req.adminCityId
        });

        if (!scenario) throw AppError.notFound('Scenario not found');

        // Bounded fast-simulation
        const result = await OptimizationRecommendationEngine.runWhatIfScenario(scenario._id.toString());

        res.json({ success: true, data: result });
    }
}
