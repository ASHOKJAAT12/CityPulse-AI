import { Router } from 'express';
import healthRoutes from './health.routes';
import citiesRoutes from './cities.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import cityAdminsRoutes from './city-admins.routes';
import citizenAuthRoutes from './citizen.auth.routes';
import citizenProfileRoutes from './citizen.profile.routes';
import garbageRoutes from './garbage.routes';
import trackingRoutes from './tracking.routes';
import publicGarbageRoutes from './publicGarbage.routes';

const router = Router();

/**
 * SmartCity 360 API v1 Router
 *
 * Mounted at: /api/v1
 */

router.use('/health', healthRoutes);
router.use('/auth/citizen', citizenAuthRoutes);
router.use('/auth', authRoutes);
router.use('/citizen', citizenProfileRoutes);
router.use('/cities', citiesRoutes);
router.use('/admin', adminRoutes);
router.use('/city-admins', cityAdminsRoutes);
router.use('/garbage', garbageRoutes);
// Phase 5 — Live Tracking
router.use('/garbage', trackingRoutes);
router.use('/garbage/public', publicGarbageRoutes);

export default router;

