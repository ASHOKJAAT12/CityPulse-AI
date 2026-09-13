import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterSensorReading extends Document {
    cityId: mongoose.Types.ObjectId;
    sensorId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    value: number;
    unit: string;
    quality?: string;
    recordedAt: Date;
    source: 'SENSOR' | 'ADMIN' | 'API' | 'SIMULATOR';
    metadata?: Record<string, unknown>;
}

const waterSensorReadingSchema = new Schema<IWaterSensorReading>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        sensorId: { type: Schema.Types.ObjectId, ref: 'WaterSensor', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'WaterAsset', required: true },
        value: { type: Number, required: true },
        unit: { type: String, required: true },
        quality: { type: String },
        recordedAt: { type: Date, required: true, default: Date.now },
        source: {
            type: String,
            enum: ['SENSOR', 'ADMIN', 'API', 'SIMULATOR'],
            required: true,
            default: 'SENSOR'
        },
        metadata: { type: Schema.Types.Mixed }
    },
    // Using timeseries optimization options is ideal, but for now we stick to regular indexing
    // Mongoose supports timeseries collections, we add manual indexes
    { timestamps: false }
);

// Indexes (optimized for time-based queries)
waterSensorReadingSchema.index({ cityId: 1, recordedAt: -1 });
waterSensorReadingSchema.index({ sensorId: 1, recordedAt: -1 });
waterSensorReadingSchema.index({ assetId: 1, recordedAt: -1 });

export const WaterSensorReading = mongoose.model<IWaterSensorReading>('WaterSensorReading', waterSensorReadingSchema);
