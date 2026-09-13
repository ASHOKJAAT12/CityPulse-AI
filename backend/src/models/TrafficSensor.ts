import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficSensor extends Document {
    cityId: mongoose.Types.ObjectId;
    roadId?: mongoose.Types.ObjectId;
    intersectionId?: mongoose.Types.ObjectId;
    sensorCode: string;
    sensorType: 'VEHICLE_COUNT' | 'SPEED' | 'OCCUPANCY' | 'TRAVEL_TIME' | 'TRAFFIC_DENSITY' | 'QUEUE_LENGTH' | 'INCIDENT_DETECTOR' | 'AIR_QUALITY' | 'OTHER';
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'FAULT';
    currentValue?: number;
    unit: string;
    minThreshold?: number;
    maxThreshold?: number;
    lastReadingAt?: Date;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficSensorSchema = new Schema<ITrafficSensor>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    roadId: { type: Schema.Types.ObjectId, ref: 'TrafficRoad' },
    intersectionId: { type: Schema.Types.ObjectId, ref: 'TrafficIntersection' },
    sensorCode: { type: String, required: true },
    sensorType: {
        type: String,
        enum: ['VEHICLE_COUNT', 'SPEED', 'OCCUPANCY', 'TRAVEL_TIME', 'TRAFFIC_DENSITY', 'QUEUE_LENGTH', 'INCIDENT_DETECTOR', 'AIR_QUALITY', 'OTHER'],
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    status: {
        type: String,
        enum: ['ONLINE', 'OFFLINE', 'WARNING', 'FAULT'],
        default: 'ONLINE'
    },
    currentValue: { type: Number },
    unit: { type: String, required: true },
    minThreshold: { type: Number },
    maxThreshold: { type: Number },
    lastReadingAt: { type: Date },
    active: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

TrafficSensorSchema.index({ cityId: 1, sensorCode: 1 }, { unique: true });
TrafficSensorSchema.index({ location: '2dsphere' });
TrafficSensorSchema.index({ cityId: 1, status: 1 });

export const TrafficSensor = mongoose.models.TrafficSensor || mongoose.model<ITrafficSensor>('TrafficSensor', TrafficSensorSchema);
