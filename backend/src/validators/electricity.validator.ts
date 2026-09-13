import { z } from 'zod';

export const createElectricityAssetSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    assetType: z.enum(['POWER_PLANT', 'SUBSTATION', 'TRANSFORMER', 'FEEDER', 'POLE', 'ELECTRIC_LINE', 'SMART_METER', 'SWITCH', 'DISTRIBUTION_PANEL', 'GENERATOR', 'EV_POWER_UNIT', 'OTHER']),
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
    status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULT', 'OFFLINE', 'UNKNOWN']).optional(),
    capacity: z.number().positive().optional(),
    voltageRating: z.number().positive().optional(),
    active: z.boolean().optional(),
    metadata: z.record(z.unknown()).optional()
});

export const updateElectricityAssetSchema = createElectricityAssetSchema.partial();

const baseElectricitySensorSchema = z.object({
    assetId: z.string(),
    sensorCode: z.string().min(1),
    sensorType: z.enum(['VOLTAGE', 'CURRENT', 'POWER', 'ENERGY', 'FREQUENCY', 'POWER_FACTOR', 'TEMPERATURE', 'LOAD', 'OUTAGE', 'OTHER']),
    unit: z.string().min(1),
    minThreshold: z.number().optional(),
    maxThreshold: z.number().optional(),
    status: z.enum(['ONLINE', 'OFFLINE', 'WARNING', 'FAULT']).optional()
});

export const createElectricitySensorSchema = baseElectricitySensorSchema.refine(data => {
    if (data.minThreshold !== undefined && data.maxThreshold !== undefined) {
        return data.minThreshold <= data.maxThreshold;
    }
    return true;
}, {
    message: "minThreshold cannot be greater than maxThreshold",
    path: ["maxThreshold"]
});

export const updateElectricitySensorSchema = baseElectricitySensorSchema.partial().refine((data: any) => {
    if (data.minThreshold !== undefined && data.maxThreshold !== undefined) {
        return data.minThreshold <= data.maxThreshold;
    }
    return true;
}, {
    message: "minThreshold cannot be greater than maxThreshold",
    path: ["maxThreshold"]
});

export const createElectricitySensorReadingSchema = z.object({
    value: z.number(),
    recordedAt: z.string().datetime().optional()
});

export const createPowerOutageSchema = z.object({
    assetId: z.string().optional(),
    feederId: z.string().optional(),
    areaName: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    cause: z.string().optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    status: z.enum(['SCHEDULED', 'ACTIVE', 'RESTORATION_IN_PROGRESS', 'RESTORED', 'CANCELLED']).optional(),
    startedAt: z.string().datetime(),
    estimatedRestorationAt: z.string().datetime().optional(),
    affectedAreas: z.array(z.string()).min(1),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([
            z.number().min(-180).max(180),
            z.number().min(-90).max(90)
        ]).describe('[longitude, latitude]')
    }).optional()
});

export const updatePowerOutageSchema = createPowerOutageSchema.partial().and(z.object({
    actualRestorationAt: z.string().datetime().optional()
}));

export const createElectricityIncidentSchema = z.object({
    assetId: z.string(),
    sensorId: z.string().optional(),
    type: z.enum(['HIGH_VOLTAGE', 'LOW_VOLTAGE', 'HIGH_CURRENT', 'OVERLOAD', 'POWER_SPIKE', 'POWER_DROP', 'TRANSFORMER_FAULT', 'LINE_FAULT', 'SENSOR_FAULT', 'OVERHEATING', 'OTHER']),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    title: z.string().min(1),
    description: z.string().min(1),
    reportedValue: z.number().optional(),
    threshold: z.number().optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM']).optional(),
    assignedTo: z.string().optional()
});

export const updateElectricityIncidentSchema = createElectricityIncidentSchema.partial();

export const createElectricityMaintenanceSchema = z.object({
    assetId: z.string(),
    title: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY']),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    scheduledStart: z.string().datetime(),
    scheduledEnd: z.string().datetime(),
    notes: z.string().optional()
});

export const updateElectricityMaintenanceSchema = createElectricityMaintenanceSchema.partial().and(z.object({
    completedAt: z.string().datetime().optional()
}));
