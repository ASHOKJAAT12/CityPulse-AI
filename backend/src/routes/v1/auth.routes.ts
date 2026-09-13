/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { login, refresh, logout } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/authRateLimit';
import { loginSchema, refreshSchema, logoutSchema } from '../../validators/auth.validator';

const router = Router();

// /api/v1/auth/admin/login
router.post('/admin/login', authLimiter, validate(loginSchema), login);

// /api/v1/auth/admin/refresh
router.post('/admin/refresh', authLimiter, validate(refreshSchema), refresh);

// /api/v1/auth/admin/logout
router.post('/admin/logout', authLimiter, validate(logoutSchema), logout);

export default router;
