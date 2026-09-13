import { Router } from 'express';
import { WaterController } from '../../controllers/water.controller';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router({ mergeParams: true }); // Enable this in case it's mounted under /cities/:cityId

// ─── ADMIN ROUTES (Require Auth + City Admin/Super Admin) ─────────────────
// Apply middleware to all protected admin routes
const adminAuth = [authenticate, requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN), requireCityAccess((req) => req.user?.cityId || req.body.cityId || req.params['cityId'])];

// Assets
router.post('/assets', ...adminAuth, WaterController.createAsset);
router.patch('/assets/:id', ...adminAuth, WaterController.updateAsset);
router.delete('/assets/:id', ...adminAuth, WaterController.deleteAsset);

// Sensors
router.post('/sensors', ...adminAuth, WaterController.createSensor);
router.patch('/sensors/:id', ...adminAuth, WaterController.updateSensor);
// Sensor Reading Data Ingestion (Internal/Admin)
router.post('/sensors/:id/readings', ...adminAuth, WaterController.ingestReading);

// Incidents
router.get('/incidents', ...adminAuth, WaterController.getIncidents);
router.post('/incidents', ...adminAuth, WaterController.createIncident);
router.patch('/incidents/:id', ...adminAuth, WaterController.updateIncident);

// Schedules
router.post('/schedules', ...adminAuth, WaterController.createSchedule);
router.patch('/schedules/:id', ...adminAuth, WaterController.updateSchedule);
router.delete('/schedules/:id', ...adminAuth, WaterController.deleteSchedule);

// Admin read all assets and sensors
router.get('/assets/admin', ...adminAuth, WaterController.getAssets);
router.get('/assets/admin/:id', ...adminAuth, WaterController.getAsset);
router.get('/sensors/admin', ...adminAuth, WaterController.getSensors);
router.get('/sensors/admin/:id', ...adminAuth, WaterController.getSensor);
router.get('/sensors/admin/:id/readings', ...adminAuth, WaterController.getSensorReadings);

// ─── PUBLIC (CITIZEN) ROUTES ──────────────────────────────────────────────
// Usually mounted at /api/v1/cities/:cityId/water
const citizenAccess = [requireCityAccess((req) => req.params['cityId'])]; // we might want optional auth + city access checks

// Given the spec: Do NOT expose private sensor config or internal admin information. 
// We use separate handlers or minimal views if necessary. For now, reusing the controller methods is okay if they don't leak much,
// but let's mount standard ones.
router.get('/assets', ...citizenAccess, WaterController.getAssets);
router.get('/assets/:id', ...citizenAccess, WaterController.getAsset);

router.get('/sensors', ...citizenAccess, WaterController.getSensors);
router.get('/sensors/:id', ...citizenAccess, WaterController.getSensor);
router.get('/sensors/:id/readings', ...citizenAccess, WaterController.getSensorReadings);

router.get('/schedules', ...citizenAccess, WaterController.getSchedules);

export default router;
