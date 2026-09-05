import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { AppError, ErrorCode } from '../utils/AppError';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/cities', validate(createCitySchema), cityController.create);
 *
 * Validates the specified part of the request (body/query/params).
 * On success, the validated/transformed data replaces the original.
 * On failure, passes a ZodError to the error handler.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body'): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const result = schema.safeParse(req[target]);
            if (!result.success) {
                // Pass ZodError to error handler — it knows how to format it
                next(result.error);
                return;
            }
            // Replace with parsed (transformed) data
            (req as unknown as Record<string, unknown>)[target] = result.data;
            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Validate body against multiple schemas.
 * Use when a request contains complex nested validation requirements.
 */
export function validateAll(
    schemas: Partial<Record<ValidationTarget, ZodSchema>>
): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const errors: Record<string, unknown> = {};

        for (const [target, schema] of Object.entries(schemas)) {
            if (!schema) continue;
            const result = schema.safeParse(req[target as ValidationTarget]);
            if (!result.success) {
                errors[target] = result.error.flatten().fieldErrors;
            } else {
                (req as unknown as Record<string, unknown>)[target] = result.data;
            }
        }

        if (Object.keys(errors).length > 0) {
            next(
                new AppError('Validation failed', 422, ErrorCode.VALIDATION_ERROR, errors)
            );
            return;
        }

        next();
    };
}
