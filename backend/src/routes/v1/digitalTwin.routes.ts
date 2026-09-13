import { Router } from 'express';
import { getNodes, getRelationships, getSummary } from '../../controllers/digitalTwin.controller';
import { authenticate, requireCityAccess } from '../../middleware/auth';

const router = Router();

// /api/v1/digital-twin/* must be authenticated and isolated
router.use(authenticate, requireCityAccess((req) => {
    return req.user?.cityId ? req.user.cityId : (req.query.cityId as string);
}));

router.get('/nodes', getNodes);
router.get('/relationships', getRelationships);
router.get('/summary', getSummary);

export default router;
