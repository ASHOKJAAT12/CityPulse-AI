import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/response';
import { ErrorCode } from '../utils/AppError';

// 5 attempts per 15 minutes for Auth actions
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
        sendError(res, 'Too many login attempts. Please try again later.', 429, ErrorCode.RATE_LIMIT_EXCEEDED);
    },
});
