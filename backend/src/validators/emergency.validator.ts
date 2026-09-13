import { z } from 'zod';

export const createEmergencySchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().min(1).max(4000),
    type: z.enum(['FIRE', 'FLOOD', 'POWER_FAILURE', 'WATER_FAILURE', 'TRAFFIC_ACCIDENT', 'MAJOR_TRAFFIC_DISRUPTION', 'INFRASTRUCTURE_FAILURE', 'EV_EMERGENCY', 'STREETLIGHT_ZONE_FAILURE', 'NATURAL_EVENT', 'PUBLIC_SAFETY', 'MEDICAL', 'OTHER']),
    category: z.string().optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    priority: z.enum(['P1', 'P2', 'P3', 'P4']),
    sourceType: z.enum(['CITIZEN_REPORT', 'WATER_INCIDENT', 'ELECTRICITY_INCIDENT', 'POWER_OUTAGE', 'TRAFFIC_INCIDENT', 'TRAFFIC_CONGESTION', 'EV_INCIDENT', 'STREETLIGHT_INCIDENT', 'GARBAGE_EVENT', 'AI_INTELLIGENCE', 'ADMIN_MANUAL']),
    sourceId: z.string(),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([
            z.number().min(-180).max(180),
            z.number().min(-90).max(90)
        ])
    }).optional(),
    affectedArea: z.object({
        type: z.literal('Polygon'),
        coordinates: z.array(z.array(z.array(z.number())))
    }).optional(),
    affectedPopulationEstimate: z.number().optional(),
    publicVisibility: z.boolean().optional(),
    riskScore: z.number().min(0).max(100).optional(),
    confidence: z.number().min(0).max(1).optional()
});

export const updateEmergencySchema = createEmergencySchema.partial();

export const verifyEmergencySchema = z.object({
    action: z.enum(['VERIFY', 'MARK_FALSE_ALARM', 'REQUEST_MORE_INFORMATION']),
    notes: z.string().optional()
});

export const assignTeamSchema = z.object({
    departmentId: z.string(),
    teamId: z.string(),
    resourceIds: z.array(z.string()).optional(),
    notes: z.string().optional()
});

export const updateStatusSchema = z.object({
    status: z.enum(['REPORTED', 'VERIFIED', 'ACKNOWLEDGED', 'DISPATCHING', 'RESPONSE_IN_PROGRESS', 'CONTAINED', 'RESOLVED', 'CLOSED', 'FALSE_ALARM', 'CANCELLED']),
    notes: z.string().optional()
});

export const createResponseTeamSchema = z.object({
    name: z.string().min(1),
    teamCode: z.string().min(1),
    department: z.string(),
    type: z.string().min(1),
    members: z.array(z.object({
        name: z.string(),
        employeeCode: z.string(),
        role: z.string(),
        contact: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional()
    })),
    baseLocation: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()])
    }).optional(),
    availability: z.boolean().optional()
});

export const createEmergencyResourceSchema = z.object({
    name: z.string().min(1),
    resourceCode: z.string().min(1),
    resourceType: z.enum(['RESPONSE_VEHICLE', 'GENERATOR', 'WATER_TANKER', 'BARRIER', 'PUMP', 'MEDICAL_KIT', 'LIGHTING_UNIT', 'EV_SUPPORT', 'OTHER']),
    quantity: z.number().min(0),
    availableQuantity: z.number().min(0),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()])
    }).optional()
});
