import { GeoPoint, City } from './index';

export type VehicleType = 'COMPACTOR' | 'TIPPER' | 'MINI_TRUCK' | 'AUTO' | 'OTHER';
export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'INACTIVE';
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
export type RouteStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
// Phase 5
export type TrackingStatus = 'ONLINE' | 'STALE' | 'OFFLINE' | 'NOT_TRACKING';
export type TrackingSessionStatus = 'ACTIVE' | 'ENDED';

export interface Driver {
    _id: string;
    cityId: string;
    name: string;
    mobile: string;
    employeeId?: string;
    status: DriverStatus;
    createdAt: string;
    updatedAt: string;
}

export interface GarbageVehicle {
    _id: string;
    cityId: string;
    vehicleNumber: string;
    vehicleName?: string;
    vehicleType: VehicleType;
    capacity?: number;
    driverId?: string | Driver;
    status: VehicleStatus;
    active: boolean;
    notes?: string;
    // Phase 5 — Live Tracking
    currentLocation?: { type: 'Point'; coordinates: [number, number] };
    lastLocationAt?: string;
    trackingStatus: TrackingStatus;
    currentRouteId?: string;
    currentStopId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GarbageRouteStop {
    _id: string;
    routeId: string;
    cityId: string;
    name: string;
    address?: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    sequence: number;
    scheduledArrival?: string;
    scheduledDeparture?: string;
    notes?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GarbageRoute {
    _id: string;
    cityId: string;
    name: string;
    description?: string;
    vehicleId?: string | GarbageVehicle;
    driverId?: string | Driver;
    status: RouteStatus;
    schedule: {
        daysOfWeek: string[];
        startTime: string;
        endTime: string;
    };
    routeGeometry?: {
        type: 'LineString';
        coordinates: [number, number][];
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

/** ---- Phase 5: Live Tracking ---- */

export interface TrackingSession {
    _id: string;
    vehicleId: string;
    driverId?: string;
    cityId: string;
    routeId: string;
    status: TrackingSessionStatus;
    startedAt: string;
    endedAt?: string;
    lastLocationAt?: string;
}

export interface VehicleLocation {
    _id: string;
    vehicleId: string;
    cityId: string;
    sessionId: string;
    routeId?: string;
    location: { type: 'Point'; coordinates: [number, number] };
    speed?: number;
    heading?: number;
    accuracy?: number;
    recordedAt: string;
}

export interface EtaResult {
    etaMinutes: number | null;
    etaTimestamp: string | null;
    available: boolean;
    label: string;
}

export interface RouteProgress {
    routeId: string;
    totalStops: number;
    completedStops: number;
    currentStopId: string | null;
    nextStopId: string | null;
    remainingStops: number;
    progressPercent: number;
    distanceToNextStopKm: number | null;
    eta: EtaResult;
}

/** Vehicle data safe for public display (no driver PII) */
export interface LiveVehiclePublic {
    id: string;
    vehicleNumber: string;
    vehicleType: VehicleType;
    currentLocation: { type: 'Point'; coordinates: [number, number] } | null;
    lastLocationAt: string | null;
    trackingStatus: TrackingStatus;
    currentRoute: { _id: string; name: string } | null;
    currentStop: { _id: string; name: string; sequence: number } | null;
}

/** WebSocket event payloads */
export interface VehicleLocationUpdatedPayload {
    vehicleId: string;
    routeId: string;
    location: { type: 'Point'; coordinates: [number, number] };
    trackingStatus: TrackingStatus;
    speed?: number;
    heading?: number;
    currentStopId: string | null;
    nextStopId: string | null;
    progressPercent: number;
    completedStops: number;
    remainingStops: number;
    etaMinutes: number | null;
    etaLabel: string;
    lastUpdatedAt: string;
}

export interface VehicleStatusUpdatedPayload {
    vehicleId: string;
    trackingStatus: TrackingStatus;
    lastLocationAt?: string;
}
