import mongoose, { Schema, Document } from 'mongoose';

export interface IElectricitySensorReading extends Document {
    cityId: mongoose.Types.ObjectId;
    sensorId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    value: number;
    unit: string;
    quality: string;
    recordedAt: Date;
    source: 'SENSOR' | 'ADMIN' | 'API' | 'SIMULATOR';
    metadata?: Record<string, unknown>;
}

const electricitySensorReadingSchema = new Schema<IElectricitySensorReading>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        sensorId: { type: Schema.Types.ObjectId, ref: 'ElectricitySensor', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'ElectricityAsset', required: true },
        value: { type: Number, required: true },
        unit: { type: String, required: true },
        quality: { type: String, default: 'GOOD' },
        recordedAt: { type: Date, required: true, default: Date.now },
        source: {
            type: String,
            enum: ['SENSOR', 'ADMIN', 'API', 'SIMULATOR'],
            required: true
        },
        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Essential compound indexes for common queries
electricitySensorReadingSchema.index({ sensorId: 1, recordedAt: -1 });
electricitySensorReadingSchema.index({ assetId: 1, recordedAt: -1 });
electricitySensorReadingSchema.index({ cityId: 1, recordedAt: -1 });

export const ElectricitySensorReading = mongoose.model<IElectricitySensorReading>('ElectricitySensorReading', electricitySensorReadingSchema);
