import { Router } from 'express';
import healthRoutes from './health.routes';
import citiesRoutes from './cities.routes';
import usersRoutes from './users.routes';
import authRoutes from './auth.routes';

const router = Router();

/**
 * SmartCity 360 API v1 Router
 *
 * Mounted at: /api/v1
 *
 * Current routes (Phase 0):
 *   /health   — System health check
 *   /cities   — Cities (Phase 1 stub)
 *   /users    — Users (Phase 1 stub)
 *   /auth     — Authentication (Phase 1 stub)
 *
 * Future routes (Phase 1+):
 *   /admin           — Admin management
 *   /water           — Water management (Phase 9)
 *   /electricity     — Electricity management (Phase 10)
 *   /traffic         — Traffic management (Phase 11)
 *   /ev              — EV charging stations (Phase 12)
 *   /street-lights   — Smart street lights (Phase 13)
 *   /garbage         — Garbage vehicle management (Phase 4-8)
 *   /reports         — Citizen reports (Phase 14)
 *   /notifications   — Notifications (Phase 15)
 *   /ai              — AI insights (Phase 17)
 */
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/cities', citiesRoutes);
router.use('/users', usersRoutes);

export default router;
