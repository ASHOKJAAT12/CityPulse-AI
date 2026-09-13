import mongoose, { Schema, Document } from 'mongoose';

export interface IElectricityIncident extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    sensorId?: mongoose.Types.ObjectId;
    type: 'HIGH_VOLTAGE' | 'LOW_VOLTAGE' | 'HIGH_CURRENT' | 'OVERLOAD' | 'POWER_SPIKE' | 'POWER_DROP' | 'TRANSFORMER_FAULT' | 'LINE_FAULT' | 'SENSOR_FAULT' | 'OVERHEATING' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    reportedValue?: number;
    threshold?: number;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_ALARM';
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    createdBy?: mongoose.Types.ObjectId; // null if system generated
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

const electricityIncidentSchema = new Schema<IElectricityIncident>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'ElectricityAsset', required: true },
        sensorId: { type: Schema.Types.ObjectId, ref: 'ElectricitySensor' },
        type: {
            type: String,
            enum: ['HIGH_VOLTAGE', 'LOW_VOLTAGE', 'HIGH_CURRENT', 'OVERLOAD', 'POWER_SPIKE', 'POWER_DROP', 'TRANSFORMER_FAULT', 'LINE_FAULT', 'SENSOR_FAULT', 'OVERHEATING', 'OTHER'],
            required: true
        },
        severity: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            required: true
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        reportedValue: { type: Number },
        threshold: { type: Number },
        status: {
            type: String,
            enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM'],
            default: 'OPEN'
        },
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        resolvedAt: { type: Date }
    },
    { timestamps: true }
);

electricityIncidentSchema.index({ cityId: 1, status: 1 });
electricityIncidentSchema.index({ cityId: 1, assetId: 1 });
electricityIncidentSchema.index({ location: '2dsphere' });

export const ElectricityIncident = mongoose.model<IElectricityIncident>('ElectricityIncident', electricityIncidentSchema);
