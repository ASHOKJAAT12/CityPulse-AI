import { Router, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * GET /api/v1/cities
 * Phase 1+: Returns paginated list of cities.
 * Phase 0: Returns stub with architecture information.
 */
router.get('/', (_req: Request, res: Response) => {
    sendSuccess(
        res,
        {
            cities: [],
            note: 'Cities API — Phase 1 implementation pending',
            architecture: 'Every city-scoped resource will be related to a City entity via cityId',
        },
        'Cities endpoint ready (Phase 1 implementation pending)',
        200
    );
});

/**
 * GET /api/v1/cities/:cityId
 * Phase 1+: Returns a specific city.
 */
router.get('/:cityId', (_req: Request, _res: Response, next) => {
    next(AppError.notImplemented('GET /cities/:cityId — Phase 1'));
});

export default router;
