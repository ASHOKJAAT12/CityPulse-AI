/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { GarbageVehicle } from '../models/GarbageVehicle';
import { GarbageRoute } from '../models/GarbageRoute';
import { TrackingStatus, TrackingSessionStatus } from '../constants/garbage';
import { AppError } from '../utils/AppError';
import { RouteProgressService } from '../services/garbage/RouteProgressService';
import { TrackingSession } from '../models/TrackingSession';
import mongoose from 'mongoose';

/**
 * GET /api/v1/garbage/public/live?cityId=<id>
 *
 * Returns all currently tracked vehicles for a city — public safe (no driver PII).
 * Only ONLINE and STALE vehicles are returned.
 */
export async function getLiveVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cityId = req.query['cityId'] as string;
        if (!cityId) throw AppError.badRequest('cityId query param is required');

        const vehicles = await GarbageVehicle.find({
            cityId: new mongoose.Types.ObjectId(cityId),
            trackingStatus: { $in: [TrackingStatus.ONLINE, TrackingStatus.STALE] },
            active: true,
        })
            .select('vehicleId vehicleNumber vehicleType currentLocation lastLocationAt trackingStatus currentRouteId currentStopId')
            .populate('currentRouteId', 'name')
            .populate('currentStopId', 'name sequence')
            .lean();

        // Strip driver info — public endpoint
        const publicVehicles = vehicles.map(v => ({
            id: v._id,
            vehicleNumber: v.vehicleNumber,
            vehicleType: v.vehicleType,
            currentLocation: v.currentLocation ?? null,
            lastLocationAt: v.lastLocationAt ?? null,
            trackingStatus: v.trackingStatus,
            currentRoute: v.currentRouteId ?? null,
            currentStop: v.currentStopId ?? null,
        }));

        sendSuccess(res, publicVehicles, 'Live vehicles retrieved');
    } catch (e) {
        next(e);
    }
}

/**
 * GET /api/v1/garbage/public/routes/:routeId/live
 *
 * Returns live tracking state for vehicles on a specific route.
 * Includes route progress for citizen tracking view.
 */
export async function getRouteLive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { routeId } = req.params;

        const route = await GarbageRoute.findById(routeId)
            .select('name description schedule status vehicleId cityId')
            .populate('vehicleId', 'vehicleNumber vehicleType currentLocation lastLocationAt trackingStatus')
            .lean();

        if (!route) throw AppError.notFound('Route not found');

        const vehicle = route.vehicleId as any;

        // Only compute progress if vehicle is currently tracking this route
        let progress = null;
        if (vehicle && (vehicle.trackingStatus === TrackingStatus.ONLINE || vehicle.trackingStatus === TrackingStatus.STALE)) {
            const session = await TrackingSession.findOne({
                routeId: new mongoose.Types.ObjectId(routeId),
                status: TrackingSessionStatus.ACTIVE,
            }).lean();

            if (session && vehicle.currentLocation?.coordinates) {
                progress = await RouteProgressService.calculate(
                    routeId,
                    vehicle.currentLocation.coordinates as [number, number],
                    undefined,
                    undefined,
                    [] // no need for clientside passed-stop tracking on public endpoint
                );
                // Strip stopsDetail PII (addresses, etc.) for public view
                progress = {
                    totalStops: progress.totalStops,
                    completedStops: progress.completedStops,
                    remainingStops: progress.remainingStops,
                    progressPercent: progress.progressPercent,
                    currentStopId: progress.currentStopId,
                    nextStopId: progress.nextStopId,
                    distanceToNextStopKm: progress.distanceToNextStopKm,
                    eta: progress.eta,
                };
            }
        }

        const publicResponse = {
            route: {
                id: route._id,
                name: route.name,
                description: route.description,
                schedule: route.schedule,
                status: route.status,
            },
            vehicle: vehicle ? {
                id: vehicle._id,
                vehicleNumber: vehicle.vehicleNumber,
                vehicleType: vehicle.vehicleType,
                currentLocation: vehicle.currentLocation ?? null,
                lastLocationAt: vehicle.lastLocationAt ?? null,
                trackingStatus: vehicle.trackingStatus,
            } : null,
            progress,
        };

        sendSuccess(res, publicResponse, 'Route live data retrieved');
    } catch (e) {
        next(e);
    }
}
