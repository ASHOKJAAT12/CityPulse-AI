import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightSensorReading extends Document {
    cityId: mongoose.Types.ObjectId;
    sensorId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    controllerId?: mongoose.Types.ObjectId;
    value: number;
    unit: string;
    quality?: string;
    recordedAt: Date;
    source: 'SENSOR' | 'ADMIN' | 'API' | 'SIMULATOR';
    metadata?: Record<string, any>;
}

const StreetlightSensorReadingSchema = new Schema<IStreetlightSensorReading>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    sensorId: { type: Schema.Types.ObjectId, ref: 'StreetlightSensor', required: true },
    assetId: { type: Schema.Types.ObjectId, ref: 'StreetlightAsset', required: true },
    controllerId: { type: Schema.Types.ObjectId, ref: 'StreetlightController' },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    quality: { type: String },
    recordedAt: { type: Date, required: true },
    source: {
        type: String,
        enum: ['SENSOR', 'ADMIN', 'API', 'SIMULATOR'],
        required: true,
        default: 'SENSOR'
    },
    metadata: { type: Schema.Types.Mixed }
});

// Compound Indexes for fast timeseries queries
StreetlightSensorReadingSchema.index({ cityId: 1, recordedAt: -1 });
StreetlightSensorReadingSchema.index({ sensorId: 1, recordedAt: -1 });
StreetlightSensorReadingSchema.index({ assetId: 1, recordedAt: -1 });
StreetlightSensorReadingSchema.index({ controllerId: 1, recordedAt: -1 });

export const StreetlightSensorReading = mongoose.model<IStreetlightSensorReading>('StreetlightSensorReading', StreetlightSensorReadingSchema);
