import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 1000,
    max: 10000,
    standardHeaders: true,
    legacyHeaders: false,
});
