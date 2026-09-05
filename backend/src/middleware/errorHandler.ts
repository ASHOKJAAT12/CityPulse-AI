import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorCode } from '../utils/AppError';
import { sendError } from '../utils/response';
import logger from '../utils/logger';
import { isProduction } from '../config/env';

/**
 * Central error handler — must be the LAST middleware registered in app.ts.
 *
 * Security rules:
 * - Never expose stack traces in production.
 * - Never expose database error details in production.
 * - Never expose internal error messages for unexpected errors in production.
 * - Always return the standard { success: false, message, error: { code, details } } shape.
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void {
    const requestId = req.id ?? 'unknown';

    // ── Zod validation errors ─────────────────────────────────
    if (err instanceof ZodError) {
        const details = err.flatten().fieldErrors;
        logger.warn('Validation error', { requestId, details });
        sendError(res, 'Validation failed', 422, ErrorCode.VALIDATION_ERROR, details);
        return;
    }

    // ── Known application errors ──────────────────────────────
    if (err instanceof AppError) {
        if (!err.isOperational || err.statusCode >= 500) {
            logger.error('Application error', {
                requestId,
                errorCode: err.errorCode,
                message: err.message,
                stack: err.stack,
            });
        } else {
            logger.warn('Operational error', {
                requestId,
                errorCode: err.errorCode,
                message: err.message,
            });
        }

        sendError(
            res,
            err.message,
            err.statusCode,
            err.errorCode,
            isProduction ? undefined : err.details
        );
        return;
    }

    // ── Prisma / database errors ──────────────────────────────
    if (err.name === 'PrismaClientKnownRequestError') {
        logger.error('Database error', { requestId, name: err.name, message: err.message });
        sendError(
            res,
            'A database error occurred',
            500,
            ErrorCode.DATABASE_ERROR,
            isProduction ? undefined : err.message
        );
        return;
    }

    // ── Unexpected / unhandled errors ─────────────────────────
    logger.error('Unexpected error', {
        requestId,
        name: err.name,
        message: err.message,
        stack: err.stack,
    });

    sendError(
        res,
        isProduction ? 'An unexpected error occurred' : err.message,
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        isProduction ? undefined : err.stack
    );
}
