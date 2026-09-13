import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficRoad extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    roadCode: string;
    roadType: 'HIGHWAY' | 'MAIN_ROAD' | 'ARTERIAL' | 'RESIDENTIAL' | 'SERVICE_ROAD' | 'BRIDGE' | 'FLYOVER' | 'OTHER';
    description?: string;
    geometry: {
        type: 'LineString';
        coordinates: [number, number][]; // Array of [longitude, latitude]
    };
    startLocation?: string;
    endLocation?: string;
    lanes: number;
    speedLimit: number; // in km/h
    status: 'OPEN' | 'PARTIALLY_CLOSED' | 'CLOSED' | 'MAINTENANCE' | 'UNKNOWN';
    trafficStatus: 'FREE_FLOW' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE' | 'UNKNOWN';
    active: boolean;
    metadata?: Record<string, any>;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficRoadSchema = new Schema<ITrafficRoad>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    name: { type: String, required: true },
    roadCode: { type: String, required: true },
    roadType: {
        type: String,
        enum: ['HIGHWAY', 'MAIN_ROAD', 'ARTERIAL', 'RESIDENTIAL', 'SERVICE_ROAD', 'BRIDGE', 'FLYOVER', 'OTHER'],
        required: true
    },
    description: { type: String },
    geometry: {
        type: { type: String, enum: ['LineString'], required: true },
        coordinates: { type: [[Number]], required: true }
    },
    startLocation: { type: String },
    endLocation: { type: String },
    lanes: { type: Number, required: true, min: 1 },
    speedLimit: { type: Number, required: true, min: 5 },
    status: {
        type: String,
        enum: ['OPEN', 'PARTIALLY_CLOSED', 'CLOSED', 'MAINTENANCE', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    trafficStatus: {
        type: String,
        enum: ['FREE_FLOW', 'LIGHT', 'MODERATE', 'HEAVY', 'SEVERE', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    active: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Scoped GeoJSON geospatial index for line rendering filtering and map bounds
TrafficRoadSchema.index({ geometry: '2dsphere' });
TrafficRoadSchema.index({ cityId: 1, roadCode: 1 }, { unique: true });
TrafficRoadSchema.index({ cityId: 1, status: 1 });
TrafficRoadSchema.index({ cityId: 1, trafficStatus: 1 });

export const TrafficRoad = mongoose.models.TrafficRoad || mongoose.model<ITrafficRoad>('TrafficRoad', TrafficRoadSchema);
