import { z } from 'zod';
import mongoose from 'mongoose';

// --- Shared Utilities ---
const ObjectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format'
});

const PointGeoJSON = z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]) // [long, lat]
});

const LineStringGeoJSON = z.object({
    type: z.literal('LineString'),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(2)
});

// --- Road Validator ---
export const createRoadSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        roadCode: z.string().min(2),
        roadType: z.enum(['HIGHWAY', 'MAIN_ROAD', 'ARTERIAL', 'RESIDENTIAL', 'SERVICE_ROAD', 'BRIDGE', 'FLYOVER', 'OTHER']),
        description: z.string().optional(),
        geometry: LineStringGeoJSON,
        lanes: z.number().int().min(1),
        speedLimit: z.number().positive(),
        status: z.enum(['OPEN', 'PARTIALLY_CLOSED', 'CLOSED', 'MAINTENANCE', 'UNKNOWN']).optional(),
        startLocation: z.string().optional(),
        endLocation: z.string().optional()
    })
});

export const updateRoadSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        roadType: z.enum(['HIGHWAY', 'MAIN_ROAD', 'ARTERIAL', 'RESIDENTIAL', 'SERVICE_ROAD', 'BRIDGE', 'FLYOVER', 'OTHER']).optional(),
        geometry: LineStringGeoJSON.optional(),
        lanes: z.number().int().min(1).optional(),
        speedLimit: z.number().positive().optional(),
        status: z.enum(['OPEN', 'PARTIALLY_CLOSED', 'CLOSED', 'MAINTENANCE', 'UNKNOWN']).optional(),
        active: z.boolean().optional()
    })
});

// --- Intersection Validator ---
export const createIntersectionSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        intersectionCode: z.string().min(2),
        location: PointGeoJSON,
        roads: z.array(ObjectId).optional(),
        signalId: ObjectId.optional(),
        status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'CLOSED', 'UNKNOWN']).optional()
    })
});

export const updateIntersectionSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        location: PointGeoJSON.optional(),
        roads: z.array(ObjectId).optional(),
        signalId: ObjectId.nullable().optional(),
        status: z.enum(['OPERATIONAL', 'MAINTENANCE', 'CLOSED', 'UNKNOWN']).optional(),
        active: z.boolean().optional()
    })
});

// --- Signal Validator ---
export const createSignalSchema = z.object({
    body: z.object({
        intersectionId: ObjectId,
        signalCode: z.string().min(2),
        status: z.enum(['OPERATIONAL', 'WARNING', 'FAULT', 'OFFLINE', 'MAINTENANCE']).optional(),
        mode: z.enum(['AUTO', 'MANUAL', 'FLASHING', 'OFF']).optional(),
        cycleDuration: z.number().nonnegative().optional()
    })
});

export const updateSignalSchema = z.object({
    body: z.object({
        status: z.enum(['OPERATIONAL', 'WARNING', 'FAULT', 'OFFLINE', 'MAINTENANCE']).optional(),
        mode: z.enum(['AUTO', 'MANUAL', 'FLASHING', 'OFF']).optional(),
        cycleDuration: z.number().nonnegative().optional(),
        active: z.boolean().optional()
    })
});

// --- Sensor Validator ---
export const createSensorSchema = z.object({
    body: z.object({
        sensorCode: z.string().min(2),
        sensorType: z.enum(['VEHICLE_COUNT', 'SPEED', 'OCCUPANCY', 'TRAVEL_TIME', 'TRAFFIC_DENSITY', 'QUEUE_LENGTH', 'INCIDENT_DETECTOR', 'AIR_QUALITY', 'OTHER']),
        roadId: ObjectId.optional(),
        intersectionId: ObjectId.optional(),
        location: PointGeoJSON,
        unit: z.string(),
        minThreshold: z.number().optional(),
        maxThreshold: z.number().optional()
    }).refine(data => data.roadId || data.intersectionId, {
        message: 'Sensor must be mapped to either a road or an intersection',
        path: ['roadId']
    })
});

export const updateSensorSchema = z.object({
    body: z.object({
        minThreshold: z.number().optional(),
        maxThreshold: z.number().optional(),
        status: z.enum(['ONLINE', 'OFFLINE', 'WARNING', 'FAULT']).optional(),
        active: z.boolean().optional()
    })
});

// --- Sensor Reading Validator (Ingestion Engine) ---
export const ingestReadingSchema = z.object({
    body: z.object({
        value: z.number(),
        recordedAt: z.string().datetime().optional()
    })
});

// --- Incident Validator ---
export const createIncidentSchema = z.object({
    body: z.object({
        type: z.enum(['ACCIDENT', 'BREAKDOWN', 'ROAD_BLOCK', 'FLOODING', 'CONSTRUCTION', 'SIGNAL_FAILURE', 'DEBRIS', 'WRONG_WAY', 'EMERGENCY', 'OTHER']),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        title: z.string().min(2),
        description: z.string().min(5),
        location: PointGeoJSON,
        roadId: ObjectId.optional(),
        intersectionId: ObjectId.optional(),
        assignedTo: ObjectId.optional()
    })
});

export const updateIncidentSchema = z.object({
    body: z.object({
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
        status: z.enum(['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        assignedTo: ObjectId.nullable().optional()
    })
});

// --- Closure and Roadwork Validators ---
export const createClosureSchema = z.object({
    body: z.object({
        roadId: ObjectId,
        reason: z.string().min(2),
        description: z.string().min(5),
        startAt: z.string().datetime(),
        expectedEndAt: z.string().datetime(),
        status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
        affectedArea: z.string().optional(),
        detourDescription: z.string().optional()
    })
});

export const createRoadworkSchema = z.object({
    body: z.object({
        roadId: ObjectId,
        title: z.string().min(2),
        description: z.string().min(5),
        type: z.enum(['ROAD_REPAIR', 'CONSTRUCTION', 'RESURFACING', 'DRAINAGE', 'UTILITY_WORK', 'OTHER']),
        startAt: z.string().datetime(),
        expectedEndAt: z.string().datetime(),
        location: z.union([PointGeoJSON, LineStringGeoJSON]).optional()
    })
});
