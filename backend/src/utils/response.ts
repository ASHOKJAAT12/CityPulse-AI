import { Response } from 'express';

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    error: {
        code: string;
        details?: unknown;
    };
}

export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Send a standardized success response.
 */
export function sendSuccess<T>(
    res: Response,
    data: T,
    message = 'Request successful',
    statusCode = 200,
    meta?: Record<string, unknown>
): Response {
    const body: ApiSuccessResponse<T> = {
        success: true,
        message,
        data,
        ...(meta ? { meta } : {}),
    };
    return res.status(statusCode).json(body);
}

/**
 * Send a standardized error response.
 * NEVER call this directly from controllers — use the global error handler.
 */
export function sendError(
    res: Response,
    message: string,
    statusCode: number,
    errorCode: string,
    details?: unknown
): Response {
    const body: ApiErrorResponse = {
        success: false,
        message,
        error: {
            code: errorCode,
            ...(details !== undefined ? { details } : {}),
        },
    };
    return res.status(statusCode).json(body);
}

/**
 * Build pagination metadata from query params and total count.
 */
export function buildPaginationMeta(
    total: number,
    page: number,
    pageSize: number
): PaginationMeta {
    const totalPages = Math.ceil(total / pageSize);
    return {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

/**
 * Parse and clamp pagination query params.
 */
export function parsePagination(
    query: Record<string, unknown>,
    maxPageSize = 100
): { page: number; pageSize: number; skip: number } {
    const page = Math.max(1, parseInt(String(query['page'] ?? 1), 10));
    const pageSize = Math.min(
        maxPageSize,
        Math.max(1, parseInt(String(query['pageSize'] ?? 20), 10))
    );
    return { page, pageSize, skip: (page - 1) * pageSize };
}
