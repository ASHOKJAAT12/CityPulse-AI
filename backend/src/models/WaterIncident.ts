import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterIncident extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    sensorId?: mongoose.Types.ObjectId;
    type: 'LOW_WATER_LEVEL' | 'HIGH_WATER_LEVEL' | 'LOW_PRESSURE' | 'HIGH_PRESSURE' | 'ABNORMAL_FLOW' | 'SENSOR_FAULT' | 'WATER_QUALITY' | 'PIPELINE_ISSUE' | 'PUMP_FAILURE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    reportedValue?: number;
    threshold?: number;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    createdBy?: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

const waterIncidentSchema = new Schema<IWaterIncident>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'WaterAsset', required: true },
        sensorId: { type: Schema.Types.ObjectId, ref: 'WaterSensor' },
        type: {
            type: String,
            enum: ['LOW_WATER_LEVEL', 'HIGH_WATER_LEVEL', 'LOW_PRESSURE', 'HIGH_PRESSURE', 'ABNORMAL_FLOW', 'SENSOR_FAULT', 'WATER_QUALITY', 'PIPELINE_ISSUE', 'PUMP_FAILURE', 'OTHER'],
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
        reportedValue: { type: Number },
        threshold: { type: Number },
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] },
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        resolvedAt: { type: Date }
    },
    { timestamps: true }
);

// Indexes
waterIncidentSchema.index({ cityId: 1, status: 1 });
waterIncidentSchema.index({ cityId: 1, severity: 1 });
waterIncidentSchema.index({ assetId: 1 });
waterIncidentSchema.index({ cityId: 1, createdAt: -1 });
waterIncidentSchema.index({ location: '2dsphere' });

export const WaterIncident = mongoose.model<IWaterIncident>('WaterIncident', waterIncidentSchema);
