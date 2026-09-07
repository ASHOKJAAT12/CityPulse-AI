/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { GarbageVehicle } from '../../models/GarbageVehicle';
import { GarbageRoute } from '../../models/GarbageRoute';
import { TrackingSession } from '../../models/TrackingSession';
import { TrackingStatus, TrackingSessionStatus, RouteStatus } from '../../constants/garbage';
import { WS_EVENTS, roomName } from '../../constants/events';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { getIO } from '../../websocket';
import logger from '../../utils/logger';
import { RouteProgressService } from './RouteProgressService';
import { EtaService } from './EtaService';
import { LocationHistoryService } from './LocationHistoryService';

export interface GpsPayload {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
}

/**
 * In-memory set of passed stop IDs per tracking session.
 * Key: sessionId, Value: Set of stopIds that the vehicle passed.
 *
 * This is reset when a session ends. For persistence across restarts,
 * store on TrackingSession document if needed.
 */
const sessionPassedStops = new Map<string, Set<string>>();

/**
 * Stale/offline detection timers.
 * Key: vehicleId, Value: NodeJS.Timeout
 */
const staleTimers = new Map<string, NodeJS.Timeout>();

/**
 * TrackingService — orchestrates all live tracking operations.
 *
 * Flow:
 *   startTracking → create TrackingSession → mark vehicle ONLINE
 *   processLocationUpdate → validate → update vehicle → write history → progress → broadcast
 *   stopTracking → end session → mark vehicle OFFLINE → broadcast
 *   markStale (timer) → ONLINE → STALE → broadcast
 */
export class TrackingService {
    // ── Start Tracking ─────────────────────────────────────────────

    static async startTracking(
        vehicleId: string,
        routeId: string,
        adminCityId: string
    ): Promise<InstanceType<typeof TrackingSession>> {
        const [vehicle, route] = await Promise.all([
            GarbageVehicle.findById(vehicleId),
            GarbageRoute.findById(routeId),
        ]);

        if (!vehicle) throw AppError.notFound('Vehicle not found');
        if (!vehicle.active) throw AppError.badRequest('Vehicle is inactive');
        if (vehicle.cityId.toString() !== adminCityId) throw AppError.cityAccessDenied();

        if (!route) throw AppError.notFound('Route not found');
        if (route.status !== RouteStatus.ACTIVE) throw AppError.badRequest('Route must be ACTIVE to start tracking');
        if (route.cityId.toString() !== adminCityId) throw AppError.cityAccessDenied();

        // Prevent duplicate active sessions
        const existing = await TrackingSession.findOne({
            vehicleId: new mongoose.Types.ObjectId(vehicleId),
            status: TrackingSessionStatus.ACTIVE,
        });
        if (existing) {
            throw AppError.badRequest('Vehicle already has an active tracking session. Stop the current session first.');
        }

        const session = await TrackingSession.create({
            vehicleId: new mongoose.Types.ObjectId(vehicleId),
            driverId: vehicle.driverId,
            cityId: vehicle.cityId,
            routeId: new mongoose.Types.ObjectId(routeId),
            status: TrackingSessionStatus.ACTIVE,
            startedAt: new Date(),
        });

        // Update vehicle tracking state
        await GarbageVehicle.findByIdAndUpdate(vehicleId, {
            trackingStatus: TrackingStatus.ONLINE,
            currentRouteId: new mongoose.Types.ObjectId(routeId),
        });

        // Init passed-stops set
        sessionPassedStops.set(session.id as string, new Set());

        this.scheduleStaleCheck(vehicleId, vehicle.cityId.toString());

        // Broadcast
        getIO()
            .to(roomName.city(vehicle.cityId.toString()))
            .emit(WS_EVENTS.GARBAGE_TRACKING_STARTED, {
                vehicleId,
                routeId,
                sessionId: session.id,
                trackingStatus: TrackingStatus.ONLINE,
            });

        logger.info('Tracking started', { vehicleId, routeId, sessionId: session.id });
        return session;
    }

    // ── Stop Tracking ──────────────────────────────────────────────

    static async stopTracking(vehicleId: string, adminCityId: string): Promise<void> {
        const vehicle = await GarbageVehicle.findById(vehicleId);
        if (!vehicle) throw AppError.notFound('Vehicle not found');
        if (vehicle.cityId.toString() !== adminCityId) throw AppError.cityAccessDenied();

        const session = await TrackingSession.findOneAndUpdate(
            { vehicleId: new mongoose.Types.ObjectId(vehicleId), status: TrackingSessionStatus.ACTIVE },
            { status: TrackingSessionStatus.ENDED, endedAt: new Date() },
            { new: true }
        );

        if (!session) throw AppError.badRequest('No active tracking session found for this vehicle');

        // Clean up memory state
        sessionPassedStops.delete(session.id as string);
        this.cancelStaleCheck(vehicleId);

        await GarbageVehicle.findByIdAndUpdate(vehicleId, {
            trackingStatus: TrackingStatus.OFFLINE,
            currentRouteId: null,
            currentStopId: null,
        });

        getIO()
            .to(roomName.city(vehicle.cityId.toString()))
            .emit(WS_EVENTS.GARBAGE_TRACKING_STOPPED, {
                vehicleId,
                sessionId: session.id,
                trackingStatus: TrackingStatus.OFFLINE,
            });

        logger.info('Tracking stopped', { vehicleId, sessionId: session.id });
    }

    // ── Process Location Update ────────────────────────────────────

    static async processLocationUpdate(
        vehicleId: string,
        payload: GpsPayload,
        requestingCityId?: string
    ): Promise<void> {
        // Validate GPS values
        TrackingService.validateGpsPayload(payload);

        const vehicle = await GarbageVehicle.findById(vehicleId);
        if (!vehicle) throw AppError.notFound('Vehicle not found');
        if (requestingCityId && vehicle.cityId.toString() !== requestingCityId) {
            throw AppError.cityAccessDenied();
        }

        // Get active session
        const session = await TrackingSession.findOne({
            vehicleId: new mongoose.Types.ObjectId(vehicleId),
            status: TrackingSessionStatus.ACTIVE,
        });
        if (!session) throw AppError.badRequest('No active tracking session for vehicle');

        // Sanity check: detect impossible GPS jumps (>50 km in < 60 sec)
        if (vehicle.currentLocation?.coordinates && vehicle.lastLocationAt) {
            const ageSeconds = (Date.now() - vehicle.lastLocationAt.getTime()) / 1000;
            if (ageSeconds < 60) {
                const distKm = EtaService.distanceKm(
                    vehicle.currentLocation.coordinates as [number, number],
                    [payload.longitude, payload.latitude]
                );
                if (distKm > 50) {
                    logger.warn('Suspicious GPS jump detected — ignoring update', {
                        vehicleId, distKm, ageSeconds,
                    });
                    return; // Reject without throwing to avoid breaking vehicle tracking
                }
            }
        }

        const newLocation: { type: 'Point'; coordinates: [number, number] } = {
            type: 'Point',
            coordinates: [payload.longitude, payload.latitude],
        };
        const now = new Date();

        // Update vehicle current location
        await GarbageVehicle.findByIdAndUpdate(vehicleId, {
            currentLocation: newLocation,
            lastLocationAt: now,
            trackingStatus: TrackingStatus.ONLINE,
        });

        // Update session last location
        await TrackingSession.findByIdAndUpdate(session.id, { lastLocationAt: now });

        // Store history (throttled)
        await LocationHistoryService.store({
            vehicleId,
            cityId: vehicle.cityId.toString(),
            sessionId: (session.id as string),
            routeId: session.routeId?.toString(),
            driverId: session.driverId?.toString(),
            location: newLocation,
            speed: payload.speed,
            heading: payload.heading,
            accuracy: payload.accuracy,
            recordedAt: now,
        });

        // Route progress
        const passedStops = sessionPassedStops.get(session.id as string) ?? new Set<string>();
        const recentAvgSpeed = await LocationHistoryService.getRecentAvgSpeed(vehicleId);

        const progress = await RouteProgressService.calculate(
            session.routeId.toString(),
            [payload.longitude, payload.latitude],
            payload.speed,
            recentAvgSpeed,
            Array.from(passedStops)
        );

        // Auto-mark AT_STOP stops as passed when vehicle leaves
        progress.stopsDetail.forEach(detail => {
            if (detail.status === 'AT_STOP') {
                // Will be marked PASSED_STOP on next update after leaving
            }
        });
        // Mark stops that are now BEFORE_STOP but were AT_STOP as PASSED
        progress.stopsDetail.forEach(detail => {
            const stopId = detail.stop._id?.toString();
            if (!stopId) return;
            // If vehicle is within threshold — mark visited
            if (detail.distanceMeters <= env.STOP_ARRIVAL_RADIUS_METERS) {
                passedStops.add(stopId);
            }
        });
        sessionPassedStops.set(session.id as string, passedStops);

        // Update vehicle current stop
        const currentStopId = progress.currentStopId ?? progress.nextStopId;
        if (currentStopId) {
            await GarbageVehicle.findByIdAndUpdate(vehicleId, {
                currentStopId: new mongoose.Types.ObjectId(currentStopId),
            });
        }

        // Reset stale timer
        this.scheduleStaleCheck(vehicleId, vehicle.cityId.toString());

        // Build broadcast payload (public-safe)
        const publicPayload = {
            vehicleId,
            routeId: session.routeId.toString(),
            location: newLocation,
            trackingStatus: TrackingStatus.ONLINE,
            speed: payload.speed,
            heading: payload.heading,
            currentStopId: progress.currentStopId,
            nextStopId: progress.nextStopId,
            progressPercent: progress.progressPercent,
            completedStops: progress.completedStops,
            remainingStops: progress.remainingStops,
            etaMinutes: progress.eta.etaMinutes,
            etaLabel: progress.eta.label,
            lastUpdatedAt: now.toISOString(),
        };

        const io = getIO();
        io.to(roomName.city(vehicle.cityId.toString())).emit(WS_EVENTS.GARBAGE_VEHICLE_LOCATION_UPDATED, publicPayload);
        io.to(roomName.vehicle(vehicleId)).emit(WS_EVENTS.GARBAGE_VEHICLE_LOCATION_UPDATED, publicPayload);
        io.to(roomName.route(session.routeId.toString())).emit(WS_EVENTS.GARBAGE_ROUTE_PROGRESS_UPDATED, {
            ...progress,
            vehicleId,
            lastUpdatedAt: now.toISOString(),
        });
    }

    // ── Get Tracking Status ────────────────────────────────────────

    static async getTrackingStatus(vehicleId: string, requestingCityId?: string) {
        const vehicle = await GarbageVehicle.findById(vehicleId)
            .populate('currentRouteId', 'name status')
            .populate('currentStopId', 'name sequence')
            .lean();

        if (!vehicle) throw AppError.notFound('Vehicle not found');
        if (requestingCityId && (vehicle.cityId as any).toString() !== requestingCityId) {
            throw AppError.cityAccessDenied();
        }

        const session = await TrackingSession.findOne({
            vehicleId: new mongoose.Types.ObjectId(vehicleId),
            status: TrackingSessionStatus.ACTIVE,
        })
            .populate('driverId', 'name mobileNumber')
            .lean();

        return {
            vehicleId,
            trackingStatus: vehicle.trackingStatus,
            currentLocation: vehicle.currentLocation ?? null,
            lastLocationAt: vehicle.lastLocationAt ?? null,
            currentRoute: vehicle.currentRouteId ?? null,
            currentStop: vehicle.currentStopId ?? null,
            activeSession: session ?? null,
        };
    }

    // ── Stale Detection ────────────────────────────────────────────

    /**
     * Schedule a timer to transition vehicle from ONLINE → STALE.
     * Cancels any previous timer for the same vehicle.
     */
    private static scheduleStaleCheck(vehicleId: string, cityId: string): void {
        this.cancelStaleCheck(vehicleId);

        const timer = setTimeout(() => {
            void this.markVehicleStale(vehicleId, cityId);
        }, env.GPS_STALE_AFTER_SECONDS * 1000);

        staleTimers.set(vehicleId, timer);
    }

    private static cancelStaleCheck(vehicleId: string): void {
        const existing = staleTimers.get(vehicleId);
        if (existing) {
            clearTimeout(existing);
            staleTimers.delete(vehicleId);
        }
    }

    private static async markVehicleStale(vehicleId: string, cityId: string): Promise<void> {
        const vehicle = await GarbageVehicle.findById(vehicleId);
        if (!vehicle || vehicle.trackingStatus !== TrackingStatus.ONLINE) return;

        await GarbageVehicle.findByIdAndUpdate(vehicleId, { trackingStatus: TrackingStatus.STALE });

        getIO()
            .to(roomName.city(cityId))
            .emit(WS_EVENTS.GARBAGE_VEHICLE_STATUS_UPDATED, {
                vehicleId,
                trackingStatus: TrackingStatus.STALE,
                lastLocationAt: vehicle.lastLocationAt,
            });

        logger.warn('Vehicle marked STALE', { vehicleId });
    }

    // ── GPS Validation ─────────────────────────────────────────────

    static validateGpsPayload(payload: GpsPayload): void {
        const { latitude, longitude, speed, heading, accuracy } = payload;

        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
            throw AppError.badRequest('Invalid latitude: must be -90 to 90');
        }
        if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
            throw AppError.badRequest('Invalid longitude: must be -180 to 180');
        }
        if (speed !== undefined && (typeof speed !== 'number' || speed < 0)) {
            throw AppError.badRequest('Invalid speed: must be >= 0');
        }
        if (heading !== undefined && (typeof heading !== 'number' || heading < 0 || heading > 360)) {
            throw AppError.badRequest('Invalid heading: must be 0-360');
        }
        if (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0)) {
            throw AppError.badRequest('Invalid accuracy: must be >= 0');
        }
    }
}
