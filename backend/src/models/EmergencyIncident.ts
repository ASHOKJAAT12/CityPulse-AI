import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyIncident extends Document {
    cityId: Types.ObjectId;
    emergencyNumber: string;
    title: string;
    description: string;
    type: 'FIRE' | 'FLOOD' | 'POWER_FAILURE' | 'WATER_FAILURE' | 'TRAFFIC_ACCIDENT' | 'MAJOR_TRAFFIC_DISRUPTION' | 'INFRASTRUCTURE_FAILURE' | 'EV_EMERGENCY' | 'STREETLIGHT_ZONE_FAILURE' | 'NATURAL_EVENT' | 'PUBLIC_SAFETY' | 'MEDICAL' | 'OTHER';
    category?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    priority: 'P1' | 'P2' | 'P3' | 'P4';
    status: 'REPORTED' | 'VERIFIED' | 'ACKNOWLEDGED' | 'DISPATCHING' | 'RESPONSE_IN_PROGRESS' | 'CONTAINED' | 'RESOLVED' | 'CLOSED' | 'FALSE_ALARM' | 'CANCELLED';
    sourceType: 'CITIZEN_REPORT' | 'WATER_INCIDENT' | 'ELECTRICITY_INCIDENT' | 'POWER_OUTAGE' | 'TRAFFIC_INCIDENT' | 'TRAFFIC_CONGESTION' | 'EV_INCIDENT' | 'STREETLIGHT_INCIDENT' | 'GARBAGE_EVENT' | 'AI_INTELLIGENCE' | 'ADMIN_MANUAL';
    sourceId: Types.ObjectId;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    affectedArea?: {
        type: 'Polygon';
        coordinates: number[][][];
    };
    affectedPopulationEstimate?: number;
    startedAt?: Date;
    acknowledgedAt?: Date;
    dispatchedAt?: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    reportedBy?: Types.ObjectId;
    incidentCommander?: Types.ObjectId;
    assignedDepartment?: Types.ObjectId;
    currentTeam?: Types.ObjectId;
    riskScore?: number;
    confidence?: number;
    publicVisibility: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const emergencyIncidentSchema = new Schema<IEmergencyIncident>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        emergencyNumber: { type: String, required: true, unique: true },
        title: { type: String, required: true, maxlength: 255 },
        description: { type: String, required: true, maxlength: 4000 },
        type: { type: String, enum: ['FIRE', 'FLOOD', 'POWER_FAILURE', 'WATER_FAILURE', 'TRAFFIC_ACCIDENT', 'MAJOR_TRAFFIC_DISRUPTION', 'INFRASTRUCTURE_FAILURE', 'EV_EMERGENCY', 'STREETLIGHT_ZONE_FAILURE', 'NATURAL_EVENT', 'PUBLIC_SAFETY', 'MEDICAL', 'OTHER'], required: true },
        category: { type: String },
        severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
        priority: { type: String, enum: ['P1', 'P2', 'P3', 'P4'], required: true },
        status: { type: String, enum: ['REPORTED', 'VERIFIED', 'ACKNOWLEDGED', 'DISPATCHING', 'RESPONSE_IN_PROGRESS', 'CONTAINED', 'RESOLVED', 'CLOSED', 'FALSE_ALARM', 'CANCELLED'], default: 'REPORTED' },
        sourceType: { type: String, enum: ['CITIZEN_REPORT', 'WATER_INCIDENT', 'ELECTRICITY_INCIDENT', 'POWER_OUTAGE', 'TRAFFIC_INCIDENT', 'TRAFFIC_CONGESTION', 'EV_INCIDENT', 'STREETLIGHT_INCIDENT', 'GARBAGE_EVENT', 'AI_INTELLIGENCE', 'ADMIN_MANUAL'], required: true },
        sourceId: { type: Schema.Types.ObjectId, required: true },
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        affectedArea: {
            type: { type: String, enum: ['Polygon'] },
            coordinates: { type: [[[Number]]] }
        },
        affectedPopulationEstimate: { type: Number },
        startedAt: { type: Date },
        acknowledgedAt: { type: Date },
        dispatchedAt: { type: Date },
        resolvedAt: { type: Date },
        closedAt: { type: Date },
        reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        incidentCommander: { type: Schema.Types.ObjectId, ref: 'User' },
        assignedDepartment: { type: Schema.Types.ObjectId, ref: 'CityDepartment' },
        currentTeam: { type: Schema.Types.ObjectId, ref: 'ResponseTeam' },
        riskScore: { type: Number, min: 0, max: 100 },
        confidence: { type: Number, min: 0, max: 1 },
        publicVisibility: { type: Boolean, default: false }
    },
    { timestamps: true }
);

emergencyIncidentSchema.index({ cityId: 1, status: 1, priority: 1 });
emergencyIncidentSchema.index({ cityId: 1, createdAt: -1 });
emergencyIncidentSchema.index({ cityId: 1, location: '2dsphere' });
emergencyIncidentSchema.index({ cityId: 1, affectedArea: '2dsphere' });
emergencyIncidentSchema.index({ cityId: 1, emergencyNumber: 1 });
emergencyIncidentSchema.index({ cityId: 1, sourceType: 1, sourceId: 1 });

export const EmergencyIncident = model<IEmergencyIncident>('EmergencyIncident', emergencyIncidentSchema);
