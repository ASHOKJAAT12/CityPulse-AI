/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { login, refresh, logout } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, refreshSchema, logoutSchema } from '../../validators/auth.validator';

const router = Router();

// /api/v1/auth/admin/login
router.post('/admin/login', validate(loginSchema), login);

// /api/v1/auth/admin/refresh
router.post('/admin/refresh', validate(refreshSchema), refresh);

// /api/v1/auth/admin/logout
router.post('/admin/logout', validate(logoutSchema), logout);

export default router;
