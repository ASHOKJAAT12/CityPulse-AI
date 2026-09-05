/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { getProfile, updateProfile, changePassword, changeCity } from '../../controllers/citizen.profile.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';
import { citizenProfileUpdateSchema, citizenPasswordChangeSchema, citizenCityChangeSchema } from '../../validators/citizen.validator';

const router = Router();

// All citizen profile routes must be authenticated and restricted to CITIZEN role
router.use(authenticate);
router.use(requireRole(Role.CITIZEN));

// /api/v1/citizen/me
router.get('/me', getProfile);
router.patch('/me', validate(citizenProfileUpdateSchema), updateProfile);

// /api/v1/citizen/me/password
router.patch('/me/password', validate(citizenPasswordChangeSchema), changePassword);

// /api/v1/citizen/me/city
router.patch('/me/city', validate(citizenCityChangeSchema), changeCity);

export default router;
