import { GeoPoint, City } from './index';

export type VehicleType = 'COMPACTOR' | 'TIPPER' | 'MINI_TRUCK' | 'AUTO' | 'OTHER';
export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'INACTIVE';
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
export type RouteStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

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
