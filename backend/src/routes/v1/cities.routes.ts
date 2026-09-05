/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { createCity, getCities, getCityById, updateCity } from '../../controllers/city.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';
import { createCitySchema, updateCitySchema } from '../../validators/city.validator';

const router = Router();

// Only SUPER_ADMIN can manage cities at this phase
router.use(authenticate);
router.use(requireRole(Role.SUPER_ADMIN));

// /api/v1/cities
router.post('/', validate(createCitySchema), createCity);
router.get('/', getCities);

// /api/v1/cities/:id
router.get('/:id', getCityById);
router.patch('/:id', validate(updateCitySchema), updateCity);

export default router;
