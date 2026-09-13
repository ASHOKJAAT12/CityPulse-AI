import { Router } from 'express';
import { AdminNotificationController } from '../../controllers/AdminNotificationController';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router();

// Secure admin actions
router.use(authenticate, requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN));

router.get('/', AdminNotificationController.getCityNotifications);
router.post('/announcements', AdminNotificationController.createAnnouncement);

export default router;
