/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { createCity, getCities, getCityById, updateCity, getActiveCities } from '../../controllers/city.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';
import { createCitySchema, updateCitySchema } from '../../validators/city.validator';

const router = Router();

// Public: Get all active cities for registration dropdown
router.get('/active', getActiveCities);

// Public: Get public details for a specific city context
router.get('/public/:id', getCityById); // We will allow GET by ID to behave publicly in the controller by returning a wrapper

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
