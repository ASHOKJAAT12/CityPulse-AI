import { Router } from 'express';
import { NotificationController } from '../../controllers/NotificationController';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply auth to all notification routes
router.use(authenticate);

// List notifications & pagination
router.get('/', NotificationController.getNotifications);

// Unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Preferences
router.get('/preferences', NotificationController.getPreferences);
router.post('/preferences', NotificationController.updatePreference);

// Mark read/all/archive endpoints
router.post('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/:id/archive', NotificationController.archiveNotification);

export default router;
