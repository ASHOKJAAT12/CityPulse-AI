import { z } from 'zod';

export const createWaterAssetSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    assetType: z.enum(['WATER_TANK', 'RESERVOIR', 'PUMPING_STATION', 'WATER_TREATMENT_PLANT', 'PIPELINE', 'VALVE', 'DISTRIBUTION_POINT', 'SENSOR', 'OTHER']),
    assetCode: z.string().min(1, 'Asset code is required'),
    description: z.string().optional(),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([
            z.number().min(-180).max(180),
            z.number().min(-90).max(90)
        ]).describe('[longitude, latitude]')
    }),
    address: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULT', 'UNKNOWN']).optional(),
    capacity: z.number().positive().optional(),
    active: z.boolean().optional(),
    metadata: z.record(z.unknown()).optional()
});

export const updateWaterAssetSchema = createWaterAssetSchema.partial();

const baseWaterSensorSchema = z.object({
    assetId: z.string(),
    sensorCode: z.string().min(1),
    sensorType: z.enum(['WATER_LEVEL', 'PRESSURE', 'FLOW_RATE', 'QUALITY', 'TEMPERATURE', 'PH', 'TURBIDITY', 'TDS', 'OTHER']),
    unit: z.string().min(1),
    minThreshold: z.number().optional(),
    maxThreshold: z.number().optional(),
    status: z.enum(['ONLINE', 'OFFLINE', 'WARNING', 'FAULT']).optional()
});

export const createWaterSensorSchema = baseWaterSensorSchema.refine(data => {
    if (data.minThreshold !== undefined && data.maxThreshold !== undefined) {
        return data.minThreshold <= data.maxThreshold;
    }
    return true;
}, {
    message: "minThreshold cannot be greater than maxThreshold",
    path: ["maxThreshold"]
});

export const updateWaterSensorSchema = baseWaterSensorSchema.partial().refine((data: any) => {
    if (data.minThreshold !== undefined && data.maxThreshold !== undefined) {
        return data.minThreshold <= data.maxThreshold;
    }
    return true;
}, {
    message: "minThreshold cannot be greater than maxThreshold",
    path: ["maxThreshold"]
});

export const createWaterSensorReadingSchema = z.object({
    value: z.number(),
    recordedAt: z.string().datetime().optional()
});

export const createWaterIncidentSchema = z.object({
    assetId: z.string(),
    sensorId: z.string().optional(),
    type: z.enum(['LOW_WATER_LEVEL', 'HIGH_WATER_LEVEL', 'LOW_PRESSURE', 'HIGH_PRESSURE', 'ABNORMAL_FLOW', 'SENSOR_FAULT', 'WATER_QUALITY', 'PIPELINE_ISSUE', 'PUMP_FAILURE', 'OTHER']),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    title: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    assignedTo: z.string().optional()
});

export const updateWaterIncidentSchema = createWaterIncidentSchema.partial();

export const createWaterSupplyScheduleSchema = z.object({
    areaName: z.string().min(1),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([
            z.number().min(-180).max(180),
            z.number().min(-90).max(90)
        ]).describe('[longitude, latitude]')
    }).optional(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    status: z.enum(['SCHEDULED', 'ONGOING', 'DELAYED', 'CANCELLED', 'COMPLETED']).optional(),
    notes: z.string().optional()
});

export const updateWaterSupplyScheduleSchema = createWaterSupplyScheduleSchema.partial();
