import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});

// STATION VALIDATORS
export const createStationSchema = z.object({
    body: z.object({
        cityId: objectIdValidator,
        name: z.string().min(1, 'Name is required'),
        stationCode: z.string().min(1, 'Station code is required'),
        operator: z.string().min(1, 'Operator is required'),
        description: z.string().optional(),
        location: z.object({
            type: z.literal('Point'),
            coordinates: z.array(z.number()).length(2, 'Must provide [longitude, latitude]')
        }),
        address: z.string().min(1, 'Address is required'),
        stationType: z.enum(['PUBLIC', 'PRIVATE', 'COMMERCIAL', 'HIGHWAY', 'WORKPLACE', 'RESIDENTIAL', 'OTHER']),
        operatingHours: z.string().optional(),
        contact: z.string().optional(),
        amenities: z.array(z.string()).optional()
    })
});

export const updateStationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        operator: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        stationType: z.enum(['PUBLIC', 'PRIVATE', 'COMMERCIAL', 'HIGHWAY', 'WORKPLACE', 'RESIDENTIAL', 'OTHER']).optional(),
        status: z.enum(['OPERATIONAL', 'LIMITED', 'MAINTENANCE', 'OFFLINE', 'CLOSED']).optional(),
        operatingHours: z.string().optional(),
        contact: z.string().optional(),
        active: z.boolean().optional(),
        amenities: z.array(z.string()).optional()
    })
});

// CONNECTOR VALIDATORS
export const createConnectorSchema = z.object({
    body: z.object({
        connectorCode: z.string().min(1, 'Connector code is required'),
        connectorType: z.enum(['TYPE_2', 'CCS', 'CHAdeMO', 'GB_T', 'TESLA', 'OTHER']),
        powerType: z.enum(['AC', 'DC']),
        maxPowerKW: z.number().positive('Power must be positive'),
        voltage: z.number().positive(),
        current: z.number().positive()
    })
});

export const updateConnectorSchema = z.object({
    body: z.object({
        status: z.enum(['AVAILABLE', 'CHARGING', 'RESERVED', 'FAULT', 'OFFLINE', 'MAINTENANCE']).optional(),
        active: z.boolean().optional()
    })
});

// SESSION VALIDATORS
export const startSessionSchema = z.object({
    body: z.object({
        userId: objectIdValidator,
        startMeterValue: z.number().nonnegative().optional()
    })
});

export const stopSessionSchema = z.object({
    body: z.object({
        endMeterValue: z.number().nonnegative().optional(),
        energyConsumedKWh: z.number().nonnegative().optional()
    })
});

// RESERVATION VALIDATORS
export const createReservationSchema = z.object({
    body: z.object({
        userId: objectIdValidator,
        stationId: objectIdValidator,
        connectorId: objectIdValidator,
        startTime: z.string().datetime(),
        endTime: z.string().datetime()
    })
});

// TELEMETRY/READING VALIDATOR
export const ingestReadingSchema = z.object({
    body: z.object({
        connectorId: objectIdValidator.optional(),
        powerKW: z.number().nonnegative(),
        energyKWh: z.number().nonnegative(),
        voltage: z.number().nonnegative(),
        current: z.number().nonnegative(),
        temperature: z.number(),
        source: z.enum(['STATION', 'ADMIN', 'API', 'SIMULATOR']).optional()
    })
});
