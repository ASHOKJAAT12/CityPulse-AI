/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { createCityAdmin, getCityAdmins, getCityAdminById, updateCityAdmin } from '../../controllers/admin.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';
import { createCityAdminSchema, updateCityAdminSchema } from '../../validators/admin.validator';

const router = Router();

// /api/v1/city-admins -> Only SUPER_ADMIN allowed
router.use(authenticate);
router.use(requireRole(Role.SUPER_ADMIN));

router.post('/', validate(createCityAdminSchema), createCityAdmin);
router.get('/', getCityAdmins);
router.get('/:id', getCityAdminById);
router.patch('/:id', validate(updateCityAdminSchema), updateCityAdmin);

export default router;
