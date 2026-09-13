import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficIntersection extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    intersectionCode: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    roads: mongoose.Types.ObjectId[]; // Array of TrafficRoad ids meeting here
    signalId?: mongoose.Types.ObjectId; // Reference to active TrafficSignal if any
    status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED' | 'UNKNOWN';
    trafficStatus: 'FREE_FLOW' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE' | 'UNKNOWN';
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficIntersectionSchema = new Schema<ITrafficIntersection>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    name: { type: String, required: true },
    intersectionCode: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    roads: [{ type: Schema.Types.ObjectId, ref: 'TrafficRoad' }],
    signalId: { type: Schema.Types.ObjectId, ref: 'TrafficSignal' },
    status: {
        type: String,
        enum: ['OPERATIONAL', 'MAINTENANCE', 'CLOSED', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    trafficStatus: {
        type: String,
        enum: ['FREE_FLOW', 'LIGHT', 'MODERATE', 'HEAVY', 'SEVERE', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    active: { type: Boolean, default: true }
}, { timestamps: true });

TrafficIntersectionSchema.index({ cityId: 1, intersectionCode: 1 }, { unique: true });
TrafficIntersectionSchema.index({ location: '2dsphere' });
TrafficIntersectionSchema.index({ cityId: 1, trafficStatus: 1 });

export const TrafficIntersection = mongoose.models.TrafficIntersection || mongoose.model<ITrafficIntersection>('TrafficIntersection', TrafficIntersectionSchema);
