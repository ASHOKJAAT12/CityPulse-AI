import { Router } from 'express';
import { EVController } from '../../controllers/ev.controller';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { validate as validateRequest } from '../../middleware/validate';
import { Role } from '../../constants/roles';
import * as evValidators from '../../validators/ev.validator';

const router = Router();

// Middleware stacks
const adminAuth = [
    authenticate,
    requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN),
    requireCityAccess((req: any) => req.user?.cityId || req.body.cityId || req.params.cityId)
];

const citizenAuth = [
    authenticate,
    requireRole(Role.CITIZEN, Role.CITY_ADMIN, Role.SUPER_ADMIN),
    requireCityAccess((req: any) => req.params.cityId)
];

// STATIONS
router.get('/:cityId/stations', citizenAuth, EVController.getStations);
router.get('/:cityId/stations/nearby', citizenAuth, EVController.getNearbyStations);
router.get('/:cityId/stations/:id', citizenAuth, EVController.getStationById);

router.post('/stations', ...adminAuth, validateRequest(evValidators.createStationSchema), EVController.createStation);
router.patch('/:cityId/stations/:id', ...adminAuth, validateRequest(evValidators.updateStationSchema), EVController.updateStation);
router.delete('/:cityId/stations/:id', ...adminAuth, EVController.deleteStation);

// CONNECTORS
router.get('/:cityId/stations/:stationId/connectors', citizenAuth, EVController.getConnectors);
router.post('/:cityId/stations/:stationId/connectors', ...adminAuth, validateRequest(evValidators.createConnectorSchema), EVController.addConnector);
router.patch('/:cityId/stations/:stationId/connectors/:connectorId', ...adminAuth, validateRequest(evValidators.updateConnectorSchema), EVController.updateConnector);

// SESSIONS (Citizens can start/stop sessions too via mobile apps theoretically)
router.post('/sessions', citizenAuth, validateRequest(evValidators.startSessionSchema), EVController.startSession);
router.patch('/:cityId/sessions/:id', citizenAuth, validateRequest(evValidators.stopSessionSchema), EVController.stopSession);

// TELEMETRY INGESTION (Secured by Admin for physical units)
router.post('/:cityId/stations/:stationId/readings', ...adminAuth, validateRequest(evValidators.ingestReadingSchema), EVController.ingestReadings);

export default router;
