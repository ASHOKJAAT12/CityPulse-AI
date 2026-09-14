import { Router } from 'express';
import { OptimizationController } from '../../controllers/admin/OptimizationController';
import 'express-async-errors';

// Standard REST setup
const router = Router();

// /api/v1/optimization/*
// Note: Authentication & Authorization (Admin) is enforced centrally in the v1 root index hook.

router.get('/capacity', OptimizationController.getCityCapacity);

// Recommendations
router.get('/recommendations', OptimizationController.getRecommendations);
router.get('/recommendations/:id', OptimizationController.getRecommendation);
router.post('/recommendations/:id/accept', OptimizationController.acceptRecommendation);
router.post('/recommendations/:id/apply', OptimizationController.applyRecommendation);

// Scenarios
router.get('/scenarios', OptimizationController.getScenarios);
router.post('/scenarios', OptimizationController.createScenario);
router.post('/scenarios/:id/run', OptimizationController.runScenarioSimulation);

export default router;
