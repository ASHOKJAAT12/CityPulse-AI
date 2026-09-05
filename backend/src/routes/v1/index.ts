import { Router } from 'express';
import healthRoutes from './health.routes';
import citiesRoutes from './cities.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import cityAdminsRoutes from './city-admins.routes';

const router = Router();

/**
 * SmartCity 360 API v1 Router
 *
 * Mounted at: /api/v1
 */

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/cities', citiesRoutes);
router.use('/admin', adminRoutes);
router.use('/city-admins', cityAdminsRoutes);

export default router;

