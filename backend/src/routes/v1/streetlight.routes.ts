import { Router } from 'express';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { Role } from '../../constants/roles';
import * as validation from '../../validators/streetlight.validator';
import { StreetlightController } from '../../controllers/streetlight.controller';

const router = Router();
router.use(authenticate);
router.use(requireCityAccess((req: any) => req.user?.cityId || req.body.cityId || req.params.cityId));

// Admin / Dispatcher routes
router.use(requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN));

router.route('/assets')
    .get(StreetlightController.getAssets)
    .post(validate(validation.createAssetSchema), StreetlightController.createAsset);

router.route('/assets/:id')
    .get(StreetlightController.getAssetById)
    .patch(validate(validation.updateAssetSchema), StreetlightController.updateAsset);

router.post('/assets/:id/override', validate(validation.controlStreetlightSchema), StreetlightController.overrideStreetlightState);

router.route('/zones')
    .get(StreetlightController.getZones)
    .post(validate(validation.createZoneSchema), StreetlightController.createZone);

router.route('/sensors')
    .get(StreetlightController.getSensors); // list

router.post('/sensors/:id/readings', validate(validation.ingestReadingSchema), StreetlightController.ingestReading);

export default router;
