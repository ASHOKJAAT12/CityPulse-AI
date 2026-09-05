import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { env, isProduction } from './config/env';
import { API_PREFIX, MAX_REQUEST_BODY_SIZE, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from './constants/app';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { sendError } from './utils/response';
import { ErrorCode } from './utils/AppError';
import v1Router from './routes/v1';

/**
 * Express app factory.
 * Returns a configured Express application instance.
 * Separated from server.ts to enable proper testing (supertest imports app, not server).
 */
export function createApp(): Application {
    const app = express();

    // ── Trust proxy (for accurate IP when behind load balancer) ──
    if (isProduction) {
        app.set('trust proxy', 1);
    }

    // ── Security headers (Helmet) ─────────────────────────────────
    app.use(
        helmet({
            contentSecurityPolicy: isProduction
                ? undefined
                : false, // Relaxed in dev for API explorer tools
            crossOriginEmbedderPolicy: false,
        })
    );

    // ── CORS ──────────────────────────────────────────────────────
    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow same-origin requests and the configured frontend URL
                const allowedOrigins = [env.FRONTEND_URL];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error(`CORS: origin '${origin}' not allowed`));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
            exposedHeaders: ['X-Request-Id'],
        })
    );

    // ── Rate limiting ─────────────────────────────────────────────
    const limiter = rateLimit({
        windowMs: RATE_LIMIT_WINDOW_MS,
        max: RATE_LIMIT_MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req: Request, res: Response) => {
            sendError(res, 'Too many requests. Please try again later.', 429, ErrorCode.RATE_LIMIT_EXCEEDED);
        },
    });
    app.use(limiter);

    // ── Compression ───────────────────────────────────────────────
    app.use(compression());

    // ── Body parsing ──────────────────────────────────────────────
    app.use(express.json({ limit: MAX_REQUEST_BODY_SIZE }));
    app.use(express.urlencoded({ extended: true, limit: MAX_REQUEST_BODY_SIZE }));

    // ── Request logging ───────────────────────────────────────────
    app.use(requestLogger);

    // ── API routes ────────────────────────────────────────────────
    app.use(API_PREFIX, v1Router);

    // ── Root redirect ─────────────────────────────────────────────
    app.get('/', (_req: Request, res: Response) => {
        res.json({
            name: 'SmartCity 360 API',
            version: '1.0.0',
            docs: `${API_PREFIX}/health`,
            phase: 'Phase 0 — Foundation',
        });
    });

    // ── 404 handler ───────────────────────────────────────────────
    app.use((req: Request, res: Response) => {
        sendError(
            res,
            `Route not found: ${req.method} ${req.originalUrl}`,
            404,
            ErrorCode.NOT_FOUND
        );
    });

    // ── Global error handler (MUST be last) ───────────────────────
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        errorHandler(err, req, res, next);
    });

    return app;
}
