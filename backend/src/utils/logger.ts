import winston from 'winston';
import { env, isDevelopment } from '../config/env';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

/** Development-friendly pretty format */
const devFormat = combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp: ts, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${String(ts)} [${level}] ${String(message)}${metaStr}${stack ? `\n${String(stack)}` : ''}`;
    })
);

/** Production structured JSON format */
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: isDevelopment ? devFormat : prodFormat,
    defaultMeta: {
        service: 'smartcity360-api',
        environment: env.NODE_ENV,
    },
    transports: [
        new winston.transports.Console(),
        // In production you'd add a file or cloud transport here
    ],
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
});

/** Create a child logger with additional context (requestId, userId, cityId) */
export function createRequestLogger(ctx: {
    requestId: string;
    userId?: string;
    cityId?: string;
}) {
    return logger.child(ctx);
}

export default logger;
