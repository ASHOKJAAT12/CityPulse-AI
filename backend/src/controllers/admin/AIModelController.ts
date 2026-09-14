import { Request, Response } from 'express';
import { AIModelRegistry } from '../../models/AIModelRegistry';
import { AIModelEvaluation } from '../../models/AIModelEvaluation';
import { ModelEvaluator } from '../../services/intelligence/evaluation/ModelEvaluator';
import logger from '../../utils/logger';

export class AIModelController {

    // GET /api/v1/ai/models
    static async getModels(req: Request, res: Response) {
        try {
            const models = await AIModelRegistry.find().sort({ createdAt: -1 });
            res.json(models);
        } catch (error) {
            logger.error('Failed to get AI models:', error);
            res.status(500).json({ error: 'Failed to fetch AI models' });
        }
    }

    // GET /api/v1/ai/models/:id
    static async getModelById(req: Request, res: Response) {
        try {
            const model = await AIModelRegistry.findById(req.params.id);
            if (!model) return res.status(404).json({ error: 'Model not found' });
            res.json(model);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch model' });
        }
    }

    // GET /api/v1/ai/models/:id/evaluations
    static async getModelEvaluations(req: Request, res: Response) {
        try {
            const evaluations = await AIModelEvaluation.find({ modelId: req.params.id }).sort({ createdAt: -1 });
            res.json(evaluations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch evaluations' });
        }
    }

    // POST /api/v1/ai/models/:id/evaluate
    static async triggerEvaluation(req: Request, res: Response) {
        try {
            // Usually tied to background task, we trigger it synchronously for admin feedback
            await ModelEvaluator.evaluateActiveModels();
            res.json({ message: 'Evaluation triggered successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to trigger evaluation' });
        }
    }

    // POST /api/v1/ai/models/:id/activate
    static async activateModel(req: Request, res: Response) {
        try {
            const model = await AIModelRegistry.findById(req.params.id);
            if (!model) return res.status(404).json({ error: 'Model not found' });

            // Deactivate others for the same service + predictionType
            await AIModelRegistry.updateMany(
                { service: model.service, predictionType: model.predictionType, status: 'ACTIVE' },
                { $set: { status: 'TESTING' } }
            );

            model.status = 'ACTIVE';
            await model.save();

            res.json({ message: 'Model activated', model });
        } catch (error) {
            res.status(500).json({ error: 'Failed to activate model' });
        }
    }

    // POST /api/v1/ai/models/:id/deactivate
    static async deactivateModel(req: Request, res: Response) {
        try {
            const model = await AIModelRegistry.findByIdAndUpdate(req.params.id, { status: 'TESTING' }, { new: true });
            res.json({ message: 'Model deactivated', model });
        } catch (error) {
            res.status(500).json({ error: 'Failed to deactivate model' });
        }
    }

    // POST /api/v1/ai/models/:id/rollback
    static async rollbackModel(req: Request, res: Response) {
        // Rollback effectively means finding a previous retired/testing model and setting it to active
        res.status(501).json({ message: 'Rollback endpoint to be fully implemented with historical tracking.' });
    }
}
