import { z } from 'zod';

export const createAssetSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        assetCode: z.string().min(2),
        assetType: z.enum(['LIGHT_POLE', 'LED_FIXTURE', 'CONTROL_PANEL', 'STREETLIGHT_CONTROLLER', 'SMART_GATEWAY', 'OTHER']),
        description: z.string().optional(),
        location: z.object({
            type: z.literal('Point'),
            coordinates: z.tuple([z.number(), z.number()])
        }),
        address: z.string().optional(),
        zoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
        poleNumber: z.string().optional(),
        manufacturer: z.string().optional(),
        assetModel: z.string().optional(),
        wattage: z.number().optional()
    })
});

export const updateAssetSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        zoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional().nullable(),
        wattage: z.number().optional(),
        status: z.enum(['ON', 'OFF', 'DIMMED', 'FAULT', 'OFFLINE', 'MAINTENANCE', 'UNKNOWN']).optional(),
        active: z.boolean().optional()
    })
});

export const createZoneSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        zoneCode: z.string().min(2),
        description: z.string().optional(),
        geometry: z.object({
            type: z.literal('Polygon'),
            coordinates: z.array(z.array(z.array(z.number())))
        }).optional()
    })
});

export const createSensorSchema = z.object({
    body: z.object({
        assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
        controllerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
        sensorCode: z.string().min(2),
        sensorType: z.enum(['POWER', 'VOLTAGE', 'CURRENT', 'ENERGY', 'TEMPERATURE', 'AMBIENT_LIGHT', 'MOTION', 'CONTROLLER_HEALTH', 'OTHER']),
        unit: z.string(),
        minThreshold: z.number().optional(),
        maxThreshold: z.number().optional()
    })
});

export const ingestReadingSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
        value: z.number(),
        recordedAt: z.string().datetime().optional(),
        source: z.enum(['SENSOR', 'ADMIN', 'API', 'SIMULATOR']).optional()
    })
});

export const createScheduleSchema = z.object({
    body: z.object({
        zoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
        name: z.string(),
        daysOfWeek: z.array(z.number().min(0).max(6)),
        startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm'),
        endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm'),
        brightnessPercentage: z.number().min(0).max(100),
        mode: z.enum(['ON', 'OFF', 'DIMMED', 'AUTO'])
    })
});

export const controlStreetlightSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
        requestedState: z.enum(['ON', 'OFF', 'DIMMED', 'AUTO']),
        brightnessPercentage: z.number().min(0).max(100).optional()
    })
});
