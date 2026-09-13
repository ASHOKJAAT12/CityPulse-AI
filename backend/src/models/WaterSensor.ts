import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterSensor extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    sensorCode: string;
    sensorType: 'WATER_LEVEL' | 'PRESSURE' | 'FLOW_RATE' | 'QUALITY' | 'TEMPERATURE' | 'PH' | 'TURBIDITY' | 'TDS' | 'OTHER';
    unit: string;
    currentValue?: number;
    minThreshold?: number;
    maxThreshold?: number;
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'FAULT';
    lastReadingAt?: Date;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const waterSensorSchema = new Schema<IWaterSensor>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'WaterAsset', required: true },
        sensorCode: { type: String, required: true },
        sensorType: {
            type: String,
            enum: ['WATER_LEVEL', 'PRESSURE', 'FLOW_RATE', 'QUALITY', 'TEMPERATURE', 'PH', 'TURBIDITY', 'TDS', 'OTHER'],
            required: true
        },
        unit: { type: String, required: true },
        currentValue: { type: Number },
        minThreshold: { type: Number },
        maxThreshold: { type: Number },
        status: {
            type: String,
            enum: ['ONLINE', 'OFFLINE', 'WARNING', 'FAULT'],
            default: 'OFFLINE'
        },
        lastReadingAt: { type: Date },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Indexes
waterSensorSchema.index({ cityId: 1, status: 1 });
waterSensorSchema.index({ assetId: 1 });
waterSensorSchema.index({ sensorCode: 1 });

export const WaterSensor = mongoose.model<IWaterSensor>('WaterSensor', waterSensorSchema);
