import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficSensorReading extends Document {
    cityId: mongoose.Types.ObjectId;
    sensorId: mongoose.Types.ObjectId;
    roadId?: mongoose.Types.ObjectId;
    intersectionId?: mongoose.Types.ObjectId;
    value: number;
    unit: string;
    quality?: number; // 0-100 score of sensor confidence/quality
    recordedAt: Date;
    source: 'SENSOR' | 'ADMIN' | 'API' | 'SIMULATOR';
    metadata?: Record<string, any>;
}

const TrafficSensorReadingSchema = new Schema<ITrafficSensorReading>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    sensorId: { type: Schema.Types.ObjectId, ref: 'TrafficSensor', required: true },
    roadId: { type: Schema.Types.ObjectId, ref: 'TrafficRoad' },
    intersectionId: { type: Schema.Types.ObjectId, ref: 'TrafficIntersection' },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    quality: { type: Number, min: 0, max: 100 },
    recordedAt: { type: Date, required: true, default: Date.now },
    source: {
        type: String,
        enum: ['SENSOR', 'ADMIN', 'API', 'SIMULATOR'],
        required: true,
        default: 'SENSOR'
    },
    metadata: { type: Schema.Types.Mixed }
});

// Powerful compound indexes for timeseries querying without limits crashing the DB
TrafficSensorReadingSchema.index({ cityId: 1, recordedAt: -1 });
TrafficSensorReadingSchema.index({ sensorId: 1, recordedAt: -1 });
TrafficSensorReadingSchema.index({ roadId: 1, recordedAt: -1 });
TrafficSensorReadingSchema.index({ intersectionId: 1, recordedAt: -1 });

export const TrafficSensorReading = mongoose.models.TrafficSensorReading || mongoose.model<ITrafficSensorReading>('TrafficSensorReading', TrafficSensorReadingSchema);
