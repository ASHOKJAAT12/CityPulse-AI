import { Router } from 'express';
import { ElectricityController } from '../../controllers/electricity.controller';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router({ mergeParams: true });

// ─── ADMIN ROUTES (Require Auth + City Admin/Super Admin) ─────────────────
const adminAuth = [authenticate, requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN), requireCityAccess((req) => req.user?.cityId || req.body.cityId || req.params['cityId'])];

// Assets
router.post('/assets', ...adminAuth, ElectricityController.createAsset);
router.patch('/assets/:id', ...adminAuth, ElectricityController.updateAsset);
router.delete('/assets/:id', ...adminAuth, ElectricityController.deleteAsset);

// Sensors
router.post('/sensors', ...adminAuth, ElectricityController.createSensor);
router.patch('/sensors/:id', ...adminAuth, ElectricityController.updateSensor);
router.post('/sensors/:id/readings', ...adminAuth, ElectricityController.ingestReading);

// Incidents
router.get('/incidents', ...adminAuth, ElectricityController.getIncidents);
router.post('/incidents', ...adminAuth, ElectricityController.createIncident);
router.patch('/incidents/:id', ...adminAuth, ElectricityController.updateIncident);

// Outages
router.post('/outages', ...adminAuth, ElectricityController.createOutage);
router.patch('/outages/:id', ...adminAuth, ElectricityController.updateOutage);

// Maintenance
router.post('/maintenance', ...adminAuth, ElectricityController.createMaintenance);
router.patch('/maintenance/:id', ...adminAuth, ElectricityController.updateMaintenance);

// Admin Read
router.get('/assets/admin', ...adminAuth, ElectricityController.getAssets);
router.get('/assets/admin/:id', ...adminAuth, ElectricityController.getAsset);
router.get('/sensors/admin', ...adminAuth, ElectricityController.getSensors);
router.get('/sensors/admin/:id', ...adminAuth, ElectricityController.getSensor);
router.get('/sensors/admin/:id/readings', ...adminAuth, ElectricityController.getSensorReadings);
router.get('/outages/admin', ...adminAuth, ElectricityController.getOutages);
router.get('/maintenance/admin', ...adminAuth, ElectricityController.getMaintenance);

// ─── PUBLIC (CITIZEN) ROUTES ──────────────────────────────────────────────
const citizenAccess = [authenticate, requireCityAccess((req) => req.user?.cityId || req.params['cityId'] || req.query['cityId'] as string)];

router.get('/assets', ...citizenAccess, ElectricityController.getAssets);
router.get('/assets/:id', ...citizenAccess, ElectricityController.getAsset);

router.get('/sensors', ...citizenAccess, ElectricityController.getSensors);
router.get('/sensors/:id', ...citizenAccess, ElectricityController.getSensor);
router.get('/sensors/:id/readings', ...citizenAccess, ElectricityController.getSensorReadings);

router.get('/outages', ...citizenAccess, ElectricityController.getOutages);
router.get('/outages/:id', ...citizenAccess, ElectricityController.getOutage);
router.get('/maintenance', ...citizenAccess, ElectricityController.getMaintenance);

export default router;
