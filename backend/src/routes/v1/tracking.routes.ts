import { Router } from 'express';
import * as trackingController from '../../controllers/tracking.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { Role } from '../../constants/roles';
import { startTrackingSchema, locationUpdateSchema, locationHistoryQuerySchema } from '../../validators/garbage.validator';

const router = Router();

// All tracking endpoints require admin authentication
router.use(authenticate, requireRole(Role.SUPER_ADMIN, Role.CITY_ADMIN));

// Tracking session lifecycle
router.post('/vehicles/:vehicleId/tracking/start', validate(startTrackingSchema), trackingController.startTracking);
router.post('/vehicles/:vehicleId/tracking/stop', trackingController.stopTracking);
router.get('/vehicles/:vehicleId/tracking', trackingController.getTrackingStatus);

// HTTP GPS fallback (for devices without WebSocket support)
router.post('/tracking/location', validate(locationUpdateSchema), trackingController.httpLocationUpdate);

// Location history (admin only — contains raw GPS trace)
router.get('/vehicles/:vehicleId/location-history', validate(locationHistoryQuerySchema, 'query'), trackingController.getLocationHistory);

export default router;
