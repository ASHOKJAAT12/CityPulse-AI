import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import {
    OptimizationRecommendation,
    OptimizationScenario
} from '../../models';
import { CapacityEngine } from '../../services/optimization/CapacityEngine';
import { OptimizationRecommendationEngine } from '../../services/optimization/OptimizationRecommendationEngine';
import { AuthUser } from '../../middleware/auth';

// Helper: extract cityId from the authenticated user.
// CITY_ADMIN has a scoped cityId. SUPER_ADMIN uses the query param ?cityId= for cross-city operations.
function resolveCityId(req: Request): string {
    const user = req.user as AuthUser;
    // Prefer city-param override for SUPER_ADMIN, fallback to user's own cityId
    const paramCity = req.query['cityId'] as string | undefined;
    const cityId = paramCity || user.cityId;
    if (!cityId) throw AppError.forbidden('City context is required. Pass ?cityId= or use a city-scoped account.');
    return cityId;
}

export class OptimizationController {

    /**
     * @route GET /api/v1/optimization/capacity
     */
    static async getCityCapacity(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const capacity = await CapacityEngine.getCityCapacityBaselines(cityId);
        res.json({ success: true, data: capacity });
    }

    /**
     * @route GET /api/v1/optimization/recommendations
     */
    static async getRecommendations(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const { status, service, limit = '50', page = '1' } = req.query;

        const query: Record<string, any> = { cityId };
        if (status) query['status'] = status;
        if (service) query['service'] = service;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;

        const [recs, total] = await Promise.all([
            OptimizationRecommendation.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            OptimizationRecommendation.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: recs.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: recs
        });
    }

    /**
     * @route POST /api/v1/optimization/recommendations/generate
     */
    static async generateRecommendations(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const userId = (req.user as AuthUser).id;

        const results = await OptimizationRecommendationEngine.generateCrossServiceRecommendations(cityId, userId);

        res.json({
            success: true,
            generated: results.length,
            data: results
        });
    }

    /**
     * @route GET /api/v1/optimization/recommendations/:id
     */
    static async getRecommendation(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const rec = await OptimizationRecommendation.findOne({ _id: req.params['id'], cityId });
        if (!rec) throw AppError.notFound('Recommendation not found');
        res.json({ success: true, data: rec });
    }

    /**
     * @route POST /api/v1/optimization/recommendations/:id/accept
     */
    static async acceptRecommendation(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const rec = await OptimizationRecommendation.findOne({ _id: req.params['id'], cityId });
        if (!rec) throw AppError.notFound('Recommendation not found');

        if (!['GENERATED', 'UNDER_REVIEW'].includes(rec.status)) {
            throw AppError.badRequest(`Cannot accept a recommendation in [${rec.status}] state.`);
        }

        rec.status = 'ACCEPTED';
        rec.reviewedBy = (req.user as AuthUser).id as any;
        rec.reviewedAt = new Date();
        await rec.save();

        res.json({ success: true, data: rec });
    }

    /**
     * @route POST /api/v1/optimization/recommendations/:id/reject
     */
    static async rejectRecommendation(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const rec = await OptimizationRecommendation.findOne({ _id: req.params['id'], cityId });
        if (!rec) throw AppError.notFound('Recommendation not found');

        if (!['GENERATED', 'UNDER_REVIEW', 'ACCEPTED'].includes(rec.status)) {
            throw AppError.badRequest(`Cannot reject a recommendation in [${rec.status}] state.`);
        }

        rec.status = 'REJECTED';
        rec.reviewedBy = (req.user as AuthUser).id as any;
        rec.reviewedAt = new Date();
        await rec.save();

        res.json({ success: true, message: 'Recommendation rejected.', data: rec });
    }

    /**
     * @route POST /api/v1/optimization/recommendations/:id/apply
     */
    static async applyRecommendation(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const rec = await OptimizationRecommendation.findOne({ _id: req.params['id'], cityId });
        if (!rec) throw AppError.notFound('Recommendation not found');

        if (rec.status === 'APPLIED') {
            throw AppError.badRequest('Recommendation has already been APPLIED. Duplicate application is not permitted.');
        }
        if (rec.status !== 'ACCEPTED') {
            throw AppError.badRequest('Recommendation must be in ACCEPTED state before it can be APPLIED.');
        }

        rec.status = 'APPLIED';
        rec.appliedAt = new Date();

        // EXTENSION POINT: domain-specific physical mutations go here, gated behind status === 'ACCEPTED' check above.
        // e.g. if (rec.optimizationType === 'GARBAGE_ROUTE') { await GarbageVehicle.updateOne(...) }

        await rec.save();
        res.json({ success: true, message: 'Optimization plan applied successfully.', data: rec });
    }

    /**
     * Scenarios
     */
    static async getScenarios(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const scenarios = await OptimizationScenario.find({ cityId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: scenarios });
    }

    static async createScenario(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const userId = (req.user as AuthUser).id;

        if (!req.body.inputs || typeof req.body.inputs !== 'object') {
            throw AppError.badRequest('Scenario inputs must be a valid object.');
        }

        const scenario = await OptimizationScenario.create({
            cityId,
            name: req.body.name || 'Custom Simulation',
            description: req.body.description || '',
            scenarioType: req.body.scenarioType || 'CUSTOM',
            inputs: req.body.inputs,
            constraints: req.body.constraints || {},
            objective: req.body.objective || 'GENERAL_ANALYSIS',
            createdBy: userId
        });

        res.status(201).json({ success: true, data: scenario });
    }

    static async runScenarioSimulation(req: Request, res: Response) {
        const cityId = resolveCityId(req);
        const scenario = await OptimizationScenario.findOne({ _id: req.params['id'], cityId });
        if (!scenario) throw AppError.notFound('Scenario not found');

        if (scenario.status === 'RUNNING') {
            throw AppError.badRequest('Scenario simulation is already running.');
        }
        if (scenario.status === 'COMPLETED') {
            throw AppError.badRequest('Scenario already completed. Create a new scenario to re-simulate.');
        }

        const result = await OptimizationRecommendationEngine.runWhatIfScenario(scenario._id.toString());
        res.json({ success: true, data: result });
    }
}
