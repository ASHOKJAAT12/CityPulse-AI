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

// Phase 6 - Water Management
import waterRoutes from './water.routes';
router.use('/water', waterRoutes);

// Phase 7 - Electricity Management
import electricityRoutes from './electricity.routes';
router.use('/electricity', electricityRoutes);

// Phase 8 - Traffic Management
import trafficRoutes from './traffic.routes';
router.use('/traffic', trafficRoutes);

// Phase 9 - EV Management
import evRoutes from './ev.routes';
router.use('/ev', evRoutes);

// Phase 10 - Streetlight Management
import streetlightRoutes from './streetlight.routes';
router.use('/streetlights', streetlightRoutes);

// Phase 11 - Reports Management
import reportRoutes from './report.routes';
router.use('/reports', reportRoutes);

export default router;
