/**
 * Constants and Enums for Garbage Management
 */

export enum VehicleType {
    COMPACTOR = 'COMPACTOR',
    TIPPER = 'TIPPER',
    MINI_TRUCK = 'MINI_TRUCK',
    AUTO = 'AUTO',
    OTHER = 'OTHER',
}

export enum VehicleStatus {
    AVAILABLE = 'AVAILABLE',
    ASSIGNED = 'ASSIGNED',
    MAINTENANCE = 'MAINTENANCE',
    INACTIVE = 'INACTIVE',
}

export enum DriverStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ON_LEAVE = 'ON_LEAVE',
}

export enum RouteStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

/**
 * Phase 5 — Live Tracking
 */
export enum TrackingStatus {
    ONLINE = 'ONLINE',        // Recent GPS update received within threshold
    STALE = 'STALE',          // No update recently, but was online
    OFFLINE = 'OFFLINE',      // Session ended or device disconnected
    NOT_TRACKING = 'NOT_TRACKING', // No active tracking session
}

export enum TrackingSessionStatus {
    ACTIVE = 'ACTIVE',
    ENDED = 'ENDED',
}

export enum StopVisitStatus {
    BEFORE_STOP = 'BEFORE_STOP',
    AT_STOP = 'AT_STOP',
    PASSED_STOP = 'PASSED_STOP',
}
