import { Request, Response } from 'express';
import { PredictiveMaintenanceRisk } from '../../models/PredictiveMaintenanceRisk';
import logger from '../../utils/logger';

export class AIPredictionController {

    // GET /api/v1/predictions
    static async getPredictions(req: Request, res: Response) {
        try {
            const predictions = await PredictiveMaintenanceRisk.find().sort({ createdAt: -1 }).limit(100);
            res.json(predictions);
        } catch (error) {
            logger.error('Failed to fetch predictions:', error);
            res.status(500).json({ error: 'Failed to fetch predictions' });
        }
    }

    // GET /api/v1/predictive-maintenance
    static async getPredictiveMaintenance(req: Request, res: Response) {
        try {
            const query: any = { status: { $in: ['GENERATED', 'REVIEWED'] } };
            // Simple mapping for city if passed via middleware, etc.
            const risks = await PredictiveMaintenanceRisk.find(query).sort({ riskScore: -1 });
            res.json(risks);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch predictive maintenance risks' });
        }
    }

    // GET /api/v1/predictions/:id
    static async getPredictionById(req: Request, res: Response) {
        try {
            const prediction = await PredictiveMaintenanceRisk.findById(req.params.id);
            if (!prediction) return res.status(404).json({ error: 'Prediction not found' });
            res.json(prediction);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch prediction' });
        }
    }

    // GET /api/v1/predictions/asset/:assetId
    static async getPredictionsByAsset(req: Request, res: Response) {
        try {
            const predictions = await PredictiveMaintenanceRisk.find({ assetId: req.params.assetId }).sort({ createdAt: -1 });
            res.json(predictions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch asset predictions' });
        }
    }

    // GET /api/v1/predictions/risk-map
    static async getRiskMap(req: Request, res: Response) {
        try {
            // Used to overlay geographic coordinates on the map view
            // Requires join with Asset endpoints in real system
            const risks = await PredictiveMaintenanceRisk.find({
                status: 'GENERATED',
                riskScore: { $gte: 40 }
            });
            res.json(risks);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch risk map' });
        }
    }
}
