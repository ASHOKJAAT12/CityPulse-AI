import { Router } from 'express';
import { AIPredictionController } from '../../controllers/admin/AIPredictionController';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router();

// Securing prediction data
router.use(authenticate, requireRole(Role.SUPER_ADMIN, Role.CITY_ADMIN));

router.get('/', AIPredictionController.getPredictions);
router.get('/asset/:assetId', AIPredictionController.getPredictionsByAsset);
router.get('/risk-map', AIPredictionController.getRiskMap);

// Must be at the bottom or rename explicitly. The user guide points to /api/v1/predictive-maintenance as a root-level concept.
// Since this file might be mounted under /predictions, we handle specific IDs here.
router.get('/:id', AIPredictionController.getPredictionById);

export default router;
