import { Router } from 'express';
import { AIModelController } from '../../controllers/admin/AIModelController';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router();

// Protect ALL AI model modification endpoints heavily. Only SUPER_ADMIN or CITY_ADMIN allowed.
router.use(authenticate, requireRole(Role.SUPER_ADMIN, Role.CITY_ADMIN));

router.get('/', AIModelController.getModels);
router.get('/:id', AIModelController.getModelById);
router.get('/:id/evaluations', AIModelController.getModelEvaluations);

router.post('/:id/evaluate', AIModelController.triggerEvaluation);
router.post('/:id/activate', AIModelController.activateModel);
router.post('/:id/deactivate', AIModelController.deactivateModel);
router.post('/:id/rollback', AIModelController.rollbackModel);

export default router;
