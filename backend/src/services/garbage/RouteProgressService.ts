import { GarbageRouteStop, IGarbageRouteStop } from '../../models/GarbageRouteStop';
import { StopVisitStatus } from '../../constants/garbage';
import { env } from '../../config/env';
import { EtaService, EtaResult } from './EtaService';

export interface StopWithVisitStatus {
    stop: IGarbageRouteStop;
    status: StopVisitStatus;
    distanceMeters: number;
}

export interface RouteProgressResult {
    routeId: string;
    totalStops: number;
    completedStops: number;
    currentStopId: string | null;
    nextStopId: string | null;
    remainingStops: number;
    /** 0–100 inclusive */
    progressPercent: number;
    distanceToNextStopKm: number | null;
    stopsDetail: StopWithVisitStatus[];
    eta: EtaResult;
}

/**
 * RouteProgressService — calculates vehicle progress along a route.
 *
 * Progress logic:
 *   - Walk stops in `sequence` order.
 *   - A stop is PASSED if the vehicle has already been closer than STOP_ARRIVAL_RADIUS_METERS
 *     to it at some point (tracked via `vehiclePassedStopIds`).
 *   - A stop is AT_STOP if vehicle is currently within the radius.
 *   - Otherwise BEFORE_STOP.
 *
 * progressPercent = completedStops / totalStops * 100
 *   This is purely stop-based (not distance-based), giving a simple, reliable metric.
 */
export class RouteProgressService {
    static async calculate(
        routeId: string,
        vehicleLocation: [number, number], // [longitude, latitude]
        currentSpeed?: number,
        recentAvgSpeed?: number,
        vehiclePassedStopIds: string[] = []
    ): Promise<RouteProgressResult> {
        const stops = await GarbageRouteStop.find({ routeId, active: true })
            .sort({ sequence: 1 })
            .lean();

        const radiusKm = env.STOP_ARRIVAL_RADIUS_METERS / 1000;

        let completedCount = 0;
        let currentStopId: string | null = null;
        let nextStopId: string | null = null;
        let distanceToNextKm: number | null = null;

        const stopsDetail: StopWithVisitStatus[] = stops.map(stop => {
            const stopLoc: [number, number] = [
                stop.location.coordinates[0],
                stop.location.coordinates[1],
            ];
            const distKm = EtaService.distanceKm(vehicleLocation, stopLoc);
            const distMeters = distKm * 1000;

            const alreadyPassed = vehiclePassedStopIds.includes((stop._id as any).toString());
            let status: StopVisitStatus;

            if (alreadyPassed) {
                status = StopVisitStatus.PASSED_STOP;
                completedCount++;
            } else if (distMeters <= env.STOP_ARRIVAL_RADIUS_METERS) {
                status = StopVisitStatus.AT_STOP;
                // AT_STOP counts as current, not yet completed
                if (!currentStopId) currentStopId = (stop._id as any).toString();
            } else {
                status = StopVisitStatus.BEFORE_STOP;
                // First BEFORE_STOP that's not passed is the next stop
                if (!nextStopId && !currentStopId) {
                    nextStopId = (stop._id as any).toString();
                    distanceToNextKm = distKm;
                } else if (currentStopId && !nextStopId) {
                    nextStopId = (stop._id as any).toString();
                    distanceToNextKm = distKm;
                }
            }

            return { stop: stop as unknown as IGarbageRouteStop, status, distanceMeters: distMeters };
        });

        const totalStops = stops.length;
        const remainingStops = totalStops - completedCount;
        const progressPercent = totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0;

        // ETA to next stop
        let eta: EtaResult;
        if (nextStopId && distanceToNextKm !== null) {
            const nextStopDoc = stops.find(s => (s._id as any).toString() === nextStopId);
            if (nextStopDoc) {
                const nextLoc: [number, number] = [
                    nextStopDoc.location.coordinates[0],
                    nextStopDoc.location.coordinates[1],
                ];
                eta = EtaService.calculate(vehicleLocation, nextLoc, currentSpeed, recentAvgSpeed);
            } else {
                eta = EtaService.unavailable('Next stop not found');
            }
        } else if (progressPercent === 100) {
            eta = { etaMinutes: 0, etaTimestamp: new Date(), available: true, label: 'Route complete' };
        } else {
            eta = EtaService.unavailable('No next stop');
        }

        return {
            routeId,
            totalStops,
            completedStops: completedCount,
            currentStopId,
            nextStopId,
            remainingStops,
            progressPercent,
            distanceToNextStopKm: distanceToNextKm,
            stopsDetail,
            eta,
        };
    }
}
