import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * GET /api/v1/health
 *
 * Returns system health status including database connectivity.
 * This endpoint should be public (no auth required).
 * Used by load balancers, monitoring systems, and frontend startup checks.
 */
export function healthCheck(req: Request, res: Response): void {
    const startTime = Date.now();
    let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
    let dbLatencyMs: number | null = null;

    // ── Database connectivity check ───────────────────────────
    try {
        const readyState = mongoose.connection.readyState;
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        if ((readyState as unknown as number) === 1) {
            dbStatus = 'connected';
            dbLatencyMs = 0; // Mongoose doesn't have a direct ping; readyState is instant
        } else {
            dbStatus = 'disconnected';
        }
    } catch (err) {
        logger.error('Health check: database status check failed', { error: err, requestId: req.id });
        dbStatus = 'error';
    }

    const totalLatencyMs = Date.now() - startTime;
    const isHealthy = dbStatus === 'connected';

    const data = {
        status: isHealthy ? 'ok' : 'degraded',
        version: '1.0.0',
        phase: 'Phase 0 — Foundation',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        database: {
            status: dbStatus,
            latencyMs: dbLatencyMs,
        },
        latencyMs: totalLatencyMs,
    };

    sendSuccess(
        res,
        data,
        isHealthy ? 'SmartCity 360 API is healthy' : 'SmartCity 360 API is degraded',
        isHealthy ? 200 : 503
    );
}
