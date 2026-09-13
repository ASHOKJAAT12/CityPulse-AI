import mongoose, { Schema, Document } from 'mongoose';

export interface IEVIncident extends Document {
    cityId: mongoose.Types.ObjectId;
    stationId: mongoose.Types.ObjectId;
    connectorId?: mongoose.Types.ObjectId;
    type: 'CONNECTOR_FAULT' | 'STATION_OFFLINE' | 'POWER_FAILURE' | 'OVERHEATING' | 'COMMICATION_FAILURE' | 'AVAILABILITY_ISSUE' | 'SAFETY_ISSUE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    location?: object;
    createdBy?: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

const EVIncidentSchema = new Schema(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        stationId: { type: Schema.Types.ObjectId, ref: 'EVChargingStation', required: true },
        connectorId: { type: Schema.Types.ObjectId, ref: 'EVConnector' },
        type: {
            type: String,
            enum: ['CONNECTOR_FAULT', 'STATION_OFFLINE', 'POWER_FAILURE', 'OVERHEATING', 'COMMICATION_FAILURE', 'AVAILABILITY_ISSUE', 'SAFETY_ISSUE', 'OTHER'],
            required: true
        },
        severity: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            required: true
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
            default: 'OPEN'
        },
        location: { type: Schema.Types.Mixed },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        resolvedAt: { type: Date }
    },
    { timestamps: true }
);

EVIncidentSchema.index({ cityId: 1, status: 1 });
EVIncidentSchema.index({ stationId: 1, status: 1 });

export const EVIncident = mongoose.model<IEVIncident>('EVIncident', EVIncidentSchema);
