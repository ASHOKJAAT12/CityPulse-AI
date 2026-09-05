/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { register, login, refresh, logout } from '../../controllers/citizen.auth.controller';
import { validate } from '../../middleware/validate';
import { citizenRegisterSchema, citizenLoginSchema } from '../../validators/citizen.validator';
import { refreshSchema, logoutSchema } from '../../validators/auth.validator';

const router = Router();

// /api/v1/auth/citizen/register
router.post('/register', validate(citizenRegisterSchema), register);

// /api/v1/auth/citizen/login
router.post('/login', validate(citizenLoginSchema), login);

// /api/v1/auth/citizen/refresh
router.post('/refresh', validate(refreshSchema), refresh);

// /api/v1/auth/citizen/logout
router.post('/logout', validate(logoutSchema), logout);

export default router;
