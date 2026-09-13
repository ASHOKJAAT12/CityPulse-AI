import { Router } from 'express';
import { EmergencyController } from '../../controllers/emergency.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router();

// Base middleware for all emergency routes - require authentication at minimum
router.use(authenticate);

// ─── ADMIN & DISPATCH ROUTES ──────────────────────────────────────────────
// Operations that modify the emergency lifecycle should be restricted to CITY_ADMIN or SUPER_ADMIN
const adminOnly = requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN);

router.get('/', adminOnly, EmergencyController.getEmergencies);
router.post('/', adminOnly, EmergencyController.createEmergency);

router.get('/:id', adminOnly, EmergencyController.getEmergency);
router.patch('/:id', adminOnly, EmergencyController.updateEmergency);

router.post('/:id/verify', adminOnly, EmergencyController.verifyEmergency);
router.post('/:id/assign', adminOnly, EmergencyController.assignTeam);
router.post('/:id/dispatch', adminOnly, EmergencyController.dispatchTeam);
router.post('/:id/status', adminOnly, EmergencyController.updateStatus);

router.get('/:id/timeline', adminOnly, EmergencyController.getTimeline);

// NOTE: Creating public routes will be done in a separate file (e.g. publicEmergency.routes.ts)

export default router;
