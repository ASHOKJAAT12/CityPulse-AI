import { Router } from 'express';
import { IoTAdminController } from '../../controllers/iot/IoTAdminController';
import { IoTTelemetryController } from '../../controllers/iot/IoTTelemetryController';
import { authenticate, requireRole } from '../../middleware/auth';
import { authenticateIoTDevice } from '../../middleware/iotAuth';
import { Role } from '../../constants/roles';

const router = Router();

// ── Secure Hardware Telemetry Ingestion API (Machine Only) ───────────────────
router.post('/telemetry',
    authenticateIoTDevice,
    IoTTelemetryController.ingestTelemetry
);


// ── Front-end Administrative Endpoints (Humans Only) ─────────────────────────
router.use(authenticate, requireRole(Role.SUPER_ADMIN, Role.CITY_ADMIN));

router.get('/stats', IoTAdminController.getIoTStats);
router.get('/telemetry', IoTAdminController.getTelemetryStream);

router.get('/devices', IoTAdminController.getDevices);
router.post('/devices', IoTAdminController.registerDevice);
router.post('/devices/:id/credentials', IoTAdminController.generateCredentials);

router.get('/gateways', IoTAdminController.getGateways);
router.post('/gateways', IoTAdminController.registerGateway);


export default router;
