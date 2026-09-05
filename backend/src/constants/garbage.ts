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
