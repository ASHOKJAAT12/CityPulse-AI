/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { TrackingService } from '../services/garbage/TrackingService';
import { LocationHistoryService } from '../services/garbage/LocationHistoryService';
import { Role } from '../constants/roles';

/**
 * Resolve the cityId for admin scope.
 * CITY_ADMIN uses their own cityId. SUPER_ADMIN must pass cityId in body/query.
 */
function resolveAdminCityId(req: Request): string {
    if (req.user?.role === Role.CITY_ADMIN) return req.user.cityId!;
    return req.body?.cityId ?? req.query?.cityId ?? '';
}

/**
 * POST /api/v1/garbage/vehicles/:vehicleId/tracking/start
 * Body: { routeId }
 */
export async function startTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { vehicleId } = req.params;
        const { routeId } = req.body as { routeId: string };
        const cityId = resolveAdminCityId(req);
        const session = await TrackingService.startTracking(vehicleId, routeId, cityId);
        sendSuccess(res, { sessionId: session.id }, 'Tracking started', 200);
    } catch (e) {
        next(e);
    }
}

/**
 * POST /api/v1/garbage/vehicles/:vehicleId/tracking/stop
 */
export async function stopTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { vehicleId } = req.params;
        const cityId = resolveAdminCityId(req);
        await TrackingService.stopTracking(vehicleId, cityId);
        sendSuccess(res, null, 'Tracking stopped');
    } catch (e) {
        next(e);
    }
}

/**
 * GET /api/v1/garbage/vehicles/:vehicleId/tracking
 */
export async function getTrackingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { vehicleId } = req.params;
        const cityId = req.user?.role === Role.CITY_ADMIN ? req.user.cityId! : undefined;
        const status = await TrackingService.getTrackingStatus(vehicleId, cityId);
        sendSuccess(res, status, 'Tracking status retrieved');
    } catch (e) {
        next(e);
    }
}

/**
 * POST /api/v1/garbage/tracking/location
 * HTTP fallback for GPS ingestion (for devices without WebSocket support)
 * Body: { vehicleId, latitude, longitude, speed?, heading?, accuracy? }
 */
export async function httpLocationUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { vehicleId, latitude, longitude, speed, heading, accuracy } = req.body as {
            vehicleId: string; latitude: number; longitude: number;
            speed?: number; heading?: number; accuracy?: number;
        };
        const cityId = req.user?.role === Role.CITY_ADMIN ? req.user.cityId! : undefined;
        await TrackingService.processLocationUpdate(vehicleId, { latitude, longitude, speed, heading, accuracy }, cityId);
        sendSuccess(res, null, 'Location updated');
    } catch (e) {
        next(e);
    }
}

/**
 * GET /api/v1/garbage/vehicles/:vehicleId/location-history
 * Query: start?, end?, page?, limit?
 */
export async function getLocationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { vehicleId } = req.params;
        const { start, end, page, limit } = req.query as Record<string, string>;

        const result = await LocationHistoryService.getHistory(vehicleId, {
            start: start ? new Date(start) : undefined,
            end: end ? new Date(end) : undefined,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });

        sendSuccess(res, result, 'Location history retrieved');
    } catch (e) {
        next(e);
    }
}
