/**
 * SmartCity 360 — Custom Application Error
 *
 * All application errors should extend or use AppError.
 * The global error handler uses `isOperational` to distinguish
 * expected business errors from unexpected crashes.
 */

export enum ErrorCode {
    // Generic
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    BAD_REQUEST = 'BAD_REQUEST',
    CONFLICT = 'CONFLICT',

    // Validation
    VALIDATION_ERROR = 'VALIDATION_ERROR',

    // Auth
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    TOKEN_INVALID = 'TOKEN_INVALID',

    // City scope
    CITY_ACCESS_DENIED = 'CITY_ACCESS_DENIED',
    CITY_NOT_FOUND = 'CITY_NOT_FOUND',

    // User
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
    USER_INACTIVE = 'USER_INACTIVE',

    // Database
    DATABASE_ERROR = 'DATABASE_ERROR',

    // Rate limit
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

    // Not implemented
    NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: ErrorCode;
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    constructor(
        message: string,
        statusCode: number,
        errorCode: ErrorCode,
        details?: unknown,
        isOperational = true
    ) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.details = details;

        // Maintains proper stack trace in V8
        Error.captureStackTrace(this, this.constructor);
    }

    // ── Factory methods ───────────────────────────────────────

    static notFound(message = 'Resource not found', details?: unknown) {
        return new AppError(message, 404, ErrorCode.NOT_FOUND, details);
    }

    static badRequest(message: string, details?: unknown) {
        return new AppError(message, 400, ErrorCode.BAD_REQUEST, details);
    }

    static unauthorized(message = 'Authentication required') {
        return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
    }

    static forbidden(message = 'Access denied') {
        return new AppError(message, 403, ErrorCode.FORBIDDEN);
    }

    static conflict(message: string, details?: unknown) {
        return new AppError(message, 409, ErrorCode.CONFLICT, details);
    }

    static cityAccessDenied() {
        return new AppError(
            'You do not have access to this city\'s resources',
            403,
            ErrorCode.CITY_ACCESS_DENIED
        );
    }

    static validationError(message: string, details?: unknown) {
        return new AppError(message, 422, ErrorCode.VALIDATION_ERROR, details);
    }

    static notImplemented(feature: string) {
        return new AppError(
            `${feature} is not yet implemented`,
            501,
            ErrorCode.NOT_IMPLEMENTED
        );
    }
}
