import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightIncident extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId?: mongoose.Types.ObjectId;
    controllerId?: mongoose.Types.ObjectId;
    sensorId?: mongoose.Types.ObjectId;
    zoneId?: mongoose.Types.ObjectId;
    type: 'LIGHT_FAILURE' | 'CONTROLLER_FAILURE' | 'POWER_FAILURE' | 'OVERCONSUMPTION' | 'UNDER_VOLTAGE' | 'OVER_VOLTAGE' | 'COMMUNICATION_FAILURE' | 'SENSOR_FAILURE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdBy: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

const StreetlightIncidentSchema = new Schema<IStreetlightIncident>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: 'StreetlightAsset' },
    controllerId: { type: Schema.Types.ObjectId, ref: 'StreetlightController' },
    sensorId: { type: Schema.Types.ObjectId, ref: 'StreetlightSensor' },
    zoneId: { type: Schema.Types.ObjectId, ref: 'StreetlightZone' },
    type: {
        type: String,
        enum: ['LIGHT_FAILURE', 'CONTROLLER_FAILURE', 'POWER_FAILURE', 'OVERCONSUMPTION', 'UNDER_VOLTAGE', 'OVER_VOLTAGE', 'COMMUNICATION_FAILURE', 'SENSOR_FAILURE', 'OTHER'],
        required: true
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] }
    },
    status: {
        type: String,
        enum: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date }
}, { timestamps: true });

StreetlightIncidentSchema.index({ cityId: 1, status: 1 });
StreetlightIncidentSchema.index({ assetId: 1 });
StreetlightIncidentSchema.index({ location: '2dsphere' });

export const StreetlightIncident = mongoose.model<IStreetlightIncident>('StreetlightIncident', StreetlightIncidentSchema);
