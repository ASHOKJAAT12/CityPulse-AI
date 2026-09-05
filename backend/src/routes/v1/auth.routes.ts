import { Router, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';

const router = Router();

/**
 * Auth routes — Phase 1 implementation.
 *
 * Future routes:
 *   POST /api/v1/auth/register     — Register admin (Phase 1)
 *   POST /api/v1/auth/login        — Login (Phase 1)
 *   POST /api/v1/auth/refresh      — Refresh access token (Phase 1)
 *   POST /api/v1/auth/logout       — Revoke refresh token (Phase 1)
 *   POST /api/v1/auth/forgot-password  — Phase 2
 *   POST /api/v1/auth/reset-password   — Phase 2
 */

router.all('*', (_req: Request, _res: Response, next) => {
    next(AppError.notImplemented('Auth API — Phase 1'));
});

export default router;
