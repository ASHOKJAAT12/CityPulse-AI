import { Router } from 'express';
import * as publicGarbageController from '../../controllers/publicGarbage.controller';

const router = Router();

// No authentication required — public endpoints
router.get('/live', publicGarbageController.getLiveVehicles);
router.get('/routes/:routeId/live', publicGarbageController.getRouteLive);

export default router;
