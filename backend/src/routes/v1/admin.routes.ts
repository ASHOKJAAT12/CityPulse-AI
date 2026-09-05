/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { getProfile, updateProfile, getAdminMapData } from '../../controllers/admin.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { updateProfileSchema } from '../../validators/admin.validator';

const router = Router();

// /api/v1/admin
router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', validate(updateProfileSchema), updateProfile);

// Placeholder Map API for Admin scoping mapping features
router.get('/map', getAdminMapData);

export default router;
