import mongoose from 'mongoose';
import logger from '../utils/logger';
import { env } from './env';

/**
 * Handle MongoDB connection lifecycle and graceful shutdown.
 */
export async function connectDatabase(): Promise<void> {
    const uri = env.MONGODB_URI;

    // Add dbName manually if testing to segregate data or use the env
    const dbName = env.NODE_ENV === 'test' ? 'smartcity360_test' : env.MONGODB_DB_NAME;

    try {
        // Avoid creating multiple connections needlessly in development environments with hot-reloading
        if ((mongoose.connection.readyState as unknown as number) >= 1) {
            return;
        }

        mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected successfully'));
        mongoose.connection.on('error', (err: unknown) => logger.error('❌ MongoDB connection error:', { err: err instanceof Error ? err.message : String(err) }));
        mongoose.connection.on('disconnected', () => logger.info('MongoDB disconnected'));

        await mongoose.connect(uri, {
            dbName,
        });
    } catch (error) {
        logger.error('❌ Failed to connect to MongoDB', { error });
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    if ((mongoose.connection.readyState as unknown as number) !== 0) {
        await mongoose.disconnect();
    }
}

export default mongoose;
