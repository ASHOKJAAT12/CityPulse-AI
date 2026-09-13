import { Router } from 'express';
import { TrafficController } from '../../controllers/traffic.controller';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { Role } from '../../constants/roles';
import {
    createRoadSchema,
    updateRoadSchema,
    createIntersectionSchema,
    updateIntersectionSchema,
    createSignalSchema,
    updateSignalSchema,
    createSensorSchema,
    updateSensorSchema,
    ingestReadingSchema,
    createIncidentSchema,
    updateIncidentSchema
} from '../../validators/traffic.validator';

const router = Router({ mergeParams: true });

// --- Admin / Backend Middleware Stack ---
const adminAuth = [
    authenticate,
    requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN),
    requireCityAccess((req: any) => req.user?.cityId || req.body.cityId || req.params['cityId'])
];

const citizenAuth = [
    authenticate,
    requireRole(Role.CITIZEN, Role.CITY_ADMIN, Role.SUPER_ADMIN),
    requireCityAccess((req: any) => req.user?.cityId || req.params['cityId'])
];

// --- Traffic Roads ---
router.get('/roads', ...citizenAuth, TrafficController.getRoads);
router.get('/roads/:roadId', ...citizenAuth, TrafficController.getRoadById);
router.post('/roads', ...adminAuth, validate(createRoadSchema), TrafficController.createRoad);
router.patch('/roads/:roadId', ...adminAuth, validate(updateRoadSchema), TrafficController.updateRoad);

// --- Intersections ---
router.get('/intersections', ...citizenAuth, TrafficController.getIntersections);
router.post('/intersections', ...adminAuth, validate(createIntersectionSchema), TrafficController.createIntersection);
router.patch('/intersections/:intersectionId', ...adminAuth, validate(updateIntersectionSchema), TrafficController.updateIntersection);

// --- Signals ---
router.get('/signals', ...citizenAuth, TrafficController.getSignals);
router.post('/signals', ...adminAuth, validate(createSignalSchema), TrafficController.createSignal);
router.patch('/signals/:signalId', ...adminAuth, validate(updateSignalSchema), TrafficController.updateSignal);

// --- Sensors ---
router.get('/sensors', ...citizenAuth, TrafficController.getSensors);
router.post('/sensors', ...adminAuth, validate(createSensorSchema), TrafficController.createSensor);
router.post('/sensors/:sensorId/readings', ...adminAuth, validate(ingestReadingSchema), TrafficController.ingestSensorReading);

// --- Incidents (Congestions etc) ---
router.get('/incidents', ...citizenAuth, TrafficController.getIncidents);
router.post('/incidents', ...citizenAuth, validate(createIncidentSchema), TrafficController.createIncident);

export default router;
