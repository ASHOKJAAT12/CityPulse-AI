import { Router } from 'express';
import * as garbageController from '../../controllers/garbage.controller';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { Role } from '../../constants/roles';
import * as garbageValidator from '../../validators/garbage.validator';

const router = Router();

// Only SUPER_ADMIN and CITY_ADMIN can manage garbage info
router.use(authenticate, requireRole(Role.SUPER_ADMIN, Role.CITY_ADMIN));

// Optional middleware hook: For this resource, resource ID authorization can be 
// more complex so the controller enforces City ID matches.

// DRIVERS
router.post('/drivers', validate(garbageValidator.createDriverSchema), garbageController.createDriver);
router.get('/drivers', garbageController.getDrivers);
router.get('/drivers/:id', garbageController.getDriver);
router.patch('/drivers/:id', validate(garbageValidator.updateDriverSchema), garbageController.updateDriver);

// VEHICLES
router.post('/vehicles', validate(garbageValidator.createGarbageVehicleSchema), garbageController.createVehicle);
router.get('/vehicles', garbageController.getVehicles);
router.get('/vehicles/:id', garbageController.getVehicle);
router.patch('/vehicles/:id', validate(garbageValidator.updateGarbageVehicleSchema), garbageController.updateVehicle);

// ROUTES
router.post('/routes', validate(garbageValidator.createGarbageRouteSchema), garbageController.createRoute);
router.get('/routes', garbageController.getRoutes);
router.get('/routes/:id', garbageController.getRoute);
router.patch('/routes/:id', validate(garbageValidator.updateGarbageRouteSchema), garbageController.updateRoute);
router.post('/routes/:id/activate', garbageController.activateRoute);
router.post('/routes/:id/deactivate', garbageController.deactivateRoute);

// STOPS
router.get('/routes/:id/stops', garbageController.getStops);
router.post('/routes/:id/stops', validate(garbageValidator.createGarbageRouteStopSchema), garbageController.addStop);
router.patch('/routes/:id/stops/:stopId', validate(garbageValidator.updateGarbageRouteStopSchema), garbageController.updateStop);
router.delete('/routes/:id/stops/:stopId', garbageController.removeStop);

export default router;
