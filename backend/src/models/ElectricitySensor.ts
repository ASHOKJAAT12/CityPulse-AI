import mongoose, { Schema, Document } from 'mongoose';

export interface IElectricitySensor extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    sensorCode: string;
    sensorType: 'VOLTAGE' | 'CURRENT' | 'POWER' | 'ENERGY' | 'FREQUENCY' | 'POWER_FACTOR' | 'TEMPERATURE' | 'LOAD' | 'OUTAGE' | 'OTHER';
    unit: string;
    currentValue?: number;
    minThreshold?: number;
    maxThreshold?: number;
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'FAULT';
    lastReadingAt?: Date;
    active: boolean;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const electricitySensorSchema = new Schema<IElectricitySensor>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'ElectricityAsset', required: true },
        sensorCode: { type: String, required: true },
        sensorType: {
            type: String,
            enum: ['VOLTAGE', 'CURRENT', 'POWER', 'ENERGY', 'FREQUENCY', 'POWER_FACTOR', 'TEMPERATURE', 'LOAD', 'OUTAGE', 'OTHER'],
            required: true
        },
        unit: { type: String, required: true },
        currentValue: { type: Number },
        minThreshold: { type: Number },
        maxThreshold: { type: Number },
        status: { type: String, enum: ['ONLINE', 'OFFLINE', 'WARNING', 'FAULT'], default: 'ONLINE' },
        lastReadingAt: { type: Date },
        active: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

// Indexes
electricitySensorSchema.index({ cityId: 1, assetId: 1 });
electricitySensorSchema.index({ cityId: 1, status: 1 });
electricitySensorSchema.index({ sensorCode: 1 });

export const ElectricitySensor = mongoose.model<IElectricitySensor>('ElectricitySensor', electricitySensorSchema);
