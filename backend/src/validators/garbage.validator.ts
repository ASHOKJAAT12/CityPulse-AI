import { z } from 'zod';
import { VehicleStatus, VehicleType, DriverStatus, RouteStatus } from '../constants/garbage';
import mongoose from 'mongoose';

// Object ID validation helper
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});

// --- DRIVER ---

export const createDriverSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    mobile: z.string().min(10, 'Mobile must be at least 10 characters').trim(),
    employeeId: z.string().trim().optional(),
    status: z.enum([DriverStatus.ACTIVE, DriverStatus.INACTIVE, DriverStatus.ON_LEAVE]).optional(),
});

export const updateDriverSchema = createDriverSchema.partial();


// --- VEHICLE ---

export const createGarbageVehicleSchema = z.object({
    vehicleNumber: z.string().min(1, 'Vehicle number is required').trim(),
    vehicleName: z.string().trim().optional(),
    vehicleType: z.enum([VehicleType.COMPACTOR, VehicleType.TIPPER, VehicleType.MINI_TRUCK, VehicleType.AUTO, VehicleType.OTHER]).optional(),
    capacity: z.number().positive().optional(),
    driverId: objectIdSchema.optional().nullable(),
    status: z.enum([VehicleStatus.AVAILABLE, VehicleStatus.ASSIGNED, VehicleStatus.MAINTENANCE, VehicleStatus.INACTIVE]).optional(),
    active: z.boolean().optional(),
    notes: z.string().trim().optional(),
});

export const updateGarbageVehicleSchema = createGarbageVehicleSchema.partial();


// --- ROUTE ---

export const createGarbageRouteSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    description: z.string().trim().optional(),
    vehicleId: objectIdSchema.optional().nullable(),
    driverId: objectIdSchema.optional().nullable(),
    status: z.enum([RouteStatus.DRAFT, RouteStatus.ACTIVE, RouteStatus.INACTIVE]).optional(),
    schedule: z.object({
        daysOfWeek: z.array(z.string()).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
    }).optional(),
});

export const updateGarbageRouteSchema = createGarbageRouteSchema.partial();


// --- ROUTE STOP ---

export const createGarbageRouteStopSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    address: z.string().trim().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    sequence: z.number().positive('Sequence must be a positive number'),
    scheduledArrival: z.string().trim().optional(),
    scheduledDeparture: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    active: z.boolean().optional(),
});

export const updateGarbageRouteStopSchema = createGarbageRouteStopSchema.partial().extend({
    sequence: z.number().positive('Sequence must be a positive number').optional(),
});
