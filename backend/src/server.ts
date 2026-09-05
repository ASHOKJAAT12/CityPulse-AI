// Load environment variables FIRST before any other imports
import 'dotenv/config';

import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeWebSocket } from './websocket';
import logger from './utils/logger';

const PORT = env.PORT;

async function startServer(): Promise<void> {
    // ── 1. Connect to database ──────────────────────────────────
    await connectDatabase();

    // ── 2. Create Express app ───────────────────────────────────
    const app = createApp();

    // ── 3. Create HTTP server ───────────────────────────────────
    const server = http.createServer(app);

    // ── 4. Initialize WebSocket ─────────────────────────────────
    initializeWebSocket(server);

    // ── 5. Start listening ──────────────────────────────────────
    server.listen(PORT, () => {
        logger.info(`🚀 SmartCity 360 API started`, {
            port: PORT,
            environment: env.NODE_ENV,
            phase: 'Phase 0 — Foundation',
            apiUrl: `http://localhost:${PORT}/api/v1`,
            healthUrl: `http://localhost:${PORT}/api/v1/health`,
        });
    });

    // ── Graceful shutdown ─────────────────────────────────────────
    const shutdown = (signal: string) => {
        logger.info(`${signal} received — gracefully shutting down...`);
        server.close(() => {
            void (async () => {
                await disconnectDatabase();
                logger.info('Server shutdown complete');
                process.exit(0);
            })();
        });

        // Force shutdown after 30 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 30_000);
    };

    process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
    process.on('SIGINT', () => { void shutdown('SIGINT'); });

    // ── Unhandled errors ──────────────────────────────────────────
    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled Promise Rejection', { reason });
        // Don't exit immediately — let the process continue unless critical
    });

    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception — shutting down', { error: error.message, stack: error.stack });
        process.exit(1);
    });
}

// Start
startServer().catch((error: unknown) => {
    logger.error('Failed to start server', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
