import { Request, Response, NextFunction } from 'express';
import { Role, isGlobalRole } from '../constants/roles';
import { AppError } from '../utils/AppError';

// ── Extended Request type ─────────────────────────────────────────────────────

/**
 * The authenticated user payload attached to req.user after JWT verification.
 * Populated by the `authenticate` middleware (Phase 1 implementation).
 */
export interface AuthUser {
    id: string;
    email: string;
    role: Role;
    cityId: string | null; // null means global (SUPER_ADMIN)
    isActive: boolean;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Authentication middleware — verifies JWT and attaches `req.user`.
 *
 * PHASE 0: Returns 501 Not Implemented.
 * PHASE 1: Will verify JWT_ACCESS_SECRET, load user from DB, check isActive.
 *
 * Flow:
 *   Authorization: Bearer <token>
 *   → verify token
 *   → load user from DB
 *   → check isActive
 *   → attach req.user
 *   → next()
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
    // Phase 1 implementation placeholder
    // In Phase 1, uncomment and implement JWT verification:
    //
    // const authHeader = req.headers.authorization;
    // if (!authHeader?.startsWith('Bearer ')) {
    //   return next(AppError.unauthorized('No token provided'));
    // }
    // const token = authHeader.split(' ')[1];
    // try {
    //   const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    //   const user = await userRepository.findById(payload.sub);
    //   if (!user || !user.isActive) return next(AppError.unauthorized('User not found or inactive'));
    //   req.user = { id: user.id, email: user.email, role: user.role, cityId: user.cityId, isActive: user.isActive };
    //   next();
    // } catch {
    //   next(AppError.unauthorized('Invalid or expired token'));
    // }

    next(AppError.notImplemented('Authentication'));
}

/**
 * Role-based authorization middleware.
 *
 * Usage: router.get('/admin-resource', authenticate, requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN), handler)
 */
export function requireRole(...allowedRoles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(AppError.unauthorized());
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(AppError.forbidden(`Requires one of: ${allowedRoles.join(', ')}`));
            return;
        }
        next();
    };
}

/**
 * City-scoped authorization middleware.
 *
 * Enforces that a CITY_ADMIN or CITIZEN can only access resources belonging
 * to their own city. SUPER_ADMIN bypasses this check.
 *
 * Usage: router.get('/cities/:cityId/resources', authenticate, requireCityAccess(), handler)
 *
 * The middleware reads `req.params.cityId` by default. Pass a custom extractor
 * for cases where the city is derived from the resource body or a different param.
 */
export function requireCityAccess(
    getCityId: (req: Request) => string | undefined = (req) => req.params['cityId']
) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(AppError.unauthorized());
            return;
        }

        // SUPER_ADMIN has global access
        if (isGlobalRole(req.user.role)) {
            next();
            return;
        }

        const requestedCityId = getCityId(req);
        if (!requestedCityId) {
            next(AppError.badRequest('City ID is required'));
            return;
        }

        if (req.user.cityId !== requestedCityId) {
            next(AppError.cityAccessDenied());
            return;
        }

        next();
    };
}

/**
 * Optionally authenticate — attaches req.user if a valid token is present,
 * but does NOT block unauthenticated requests. Useful for public endpoints
 * that have enhanced behavior for authenticated users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next();
        return;
    }
    // Phase 1: attempt to verify and attach. If invalid, just continue as anonymous.
    next();
}
