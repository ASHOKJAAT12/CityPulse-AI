import { Router, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';

const router = Router();

/**
 * All user endpoints — Phase 1+ implementation.
 *
 * Future routes:
 *   GET    /api/v1/users/me         — Get current user profile
 *   PATCH  /api/v1/users/me         — Update profile
 *   GET    /api/v1/users            — SUPER_ADMIN: list all users
 *   GET    /api/v1/users/:id        — Get user by ID
 *   PATCH  /api/v1/users/:id/status — Activate/deactivate user
 */

router.all('*', (_req: Request, _res: Response, next) => {
    next(AppError.notImplemented('Users API — Phase 1'));
});

export default router;
