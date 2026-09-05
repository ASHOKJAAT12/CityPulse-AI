import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

// Extend Request to carry requestId and timing
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace Express {
        interface Request {
            id: string;
            startTime: number;
        }
    }
}

/**
 * Attaches a unique requestId to every incoming request and
 * logs method, path, status, and duration on completion.
 *
 * Logs include: requestId, method, url, statusCode, duration, userAgent
 * We deliberately do NOT log Authorization headers or request bodies.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    req.id = uuidv4();
    req.startTime = Date.now();

    // Attach requestId to response headers for debugging
    res.setHeader('X-Request-Id', req.id);

    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

        logger[level](`${req.method} ${req.originalUrl}`, {
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent') ?? 'unknown',
            ip: req.ip,
        });
    });

    next();
}
