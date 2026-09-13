import { Router } from 'express';
import { healthCheck, readyCheck } from '../../controllers/health.controller';

const router = Router();

router.get('/', (req, res) => {
    healthCheck(req, res);
});

router.get('/ready', (req, res) => {
    readyCheck(req, res);
});

/**
 * GET /api/v1/health
 * Public — no auth required
 */
router.get('/', (req, res) => {
    healthCheck(req, res);
});

export default router;
