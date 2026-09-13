import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightSensor extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    controllerId?: mongoose.Types.ObjectId;
    sensorCode: string;
    sensorType: 'POWER' | 'VOLTAGE' | 'CURRENT' | 'ENERGY' | 'TEMPERATURE' | 'AMBIENT_LIGHT' | 'MOTION' | 'CONTROLLER_HEALTH' | 'OTHER';
    currentValue?: number;
    unit: string;
    minThreshold?: number;
    maxThreshold?: number;
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'FAULT';
    lastReadingAt?: Date;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const StreetlightSensorSchema = new Schema<IStreetlightSensor>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: 'StreetlightAsset', required: true },
    controllerId: { type: Schema.Types.ObjectId, ref: 'StreetlightController' },
    sensorCode: { type: String, required: true },
    sensorType: {
        type: String,
        enum: ['POWER', 'VOLTAGE', 'CURRENT', 'ENERGY', 'TEMPERATURE', 'AMBIENT_LIGHT', 'MOTION', 'CONTROLLER_HEALTH', 'OTHER'],
        required: true
    },
    currentValue: { type: Number },
    unit: { type: String, required: true },
    minThreshold: { type: Number },
    maxThreshold: { type: Number },
    status: { type: String, enum: ['ONLINE', 'OFFLINE', 'WARNING', 'FAULT'], default: 'OFFLINE' },
    lastReadingAt: { type: Date },
    active: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

String(StreetlightSensorSchema.index({ cityId: 1, sensorCode: 1 }, { unique: true }));
StreetlightSensorSchema.index({ assetId: 1 });
StreetlightSensorSchema.index({ controllerId: 1 });

export const StreetlightSensor = mongoose.model<IStreetlightSensor>('StreetlightSensor', StreetlightSensorSchema);
