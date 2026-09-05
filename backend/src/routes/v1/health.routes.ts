import { Router } from 'express';
import { healthCheck } from '../../controllers/health.controller';

const router = Router();

/**
 * GET /api/v1/health
 * Public — no auth required
 */
router.get('/', (req, res) => {
    healthCheck(req, res);
});

export default router;
