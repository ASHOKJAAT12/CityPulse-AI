import { Router } from 'express';
import { OptimizationController } from '../../controllers/admin/OptimizationController';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';
import 'express-async-errors';

const router = Router();

// /api/v1/optimization/*
// All endpoints require authentication and CITY_ADMIN or SUPER_ADMIN role.
// The controller reads city scope from req.user.cityId set by `authenticate`.
router.use(authenticate);
router.use(requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN));

// Infrastructure Capacity
router.get('/capacity', OptimizationController.getCityCapacity);

// Recommendations — CQRS: READ (GET) and WRITE (POST) are distinct endpoints
router.get('/recommendations', OptimizationController.getRecommendations);
router.post('/recommendations/generate', OptimizationController.generateRecommendations);
// NOTE: /recommendations/generate must come before /recommendations/:id to avoid route shadowing
router.get('/recommendations/:id', OptimizationController.getRecommendation);
router.post('/recommendations/:id/accept', OptimizationController.acceptRecommendation);
router.post('/recommendations/:id/reject', OptimizationController.rejectRecommendation);
router.post('/recommendations/:id/apply', OptimizationController.applyRecommendation);

// Scenarios
router.get('/scenarios', OptimizationController.getScenarios);
router.post('/scenarios', OptimizationController.createScenario);
router.post('/scenarios/:id/run', OptimizationController.runScenarioSimulation);

export default router;
