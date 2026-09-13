import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficCongestionEvent extends Document {
    cityId: mongoose.Types.ObjectId;
    roadId?: mongoose.Types.ObjectId;
    intersectionId?: mongoose.Types.ObjectId;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    trafficStatus: 'FREE_FLOW' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE' | 'UNKNOWN';
    averageSpeed?: number;
    vehicleCount?: number;
    density?: number;
    queueLength?: number;
    startedAt: Date;
    endedAt?: Date;
    status: 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
    location?: {
        type: 'Point' | 'LineString';
        coordinates: any[];
    };
    createdAt: Date;
    updatedAt: Date;
}

const TrafficCongestionEventSchema = new Schema<ITrafficCongestionEvent>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    roadId: { type: Schema.Types.ObjectId, ref: 'TrafficRoad' },
    intersectionId: { type: Schema.Types.ObjectId, ref: 'TrafficIntersection' },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        required: true
    },
    trafficStatus: {
        type: String,
        enum: ['FREE_FLOW', 'LIGHT', 'MODERATE', 'HEAVY', 'SEVERE', 'UNKNOWN'],
        required: true
    },
    averageSpeed: { type: Number },
    vehicleCount: { type: Number },
    density: { type: Number },
    queueLength: { type: Number },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED', 'EXPIRED'],
        default: 'ACTIVE'
    },
    location: {
        type: { type: String, enum: ['Point', 'LineString'] },
        coordinates: { type: Schema.Types.Mixed }
    }
}, { timestamps: true });

TrafficCongestionEventSchema.index({ cityId: 1, status: 1 });
TrafficCongestionEventSchema.index({ cityId: 1, roadId: 1, status: 1 });
TrafficCongestionEventSchema.index({ cityId: 1, startedAt: -1 });
TrafficCongestionEventSchema.index({ location: '2dsphere' });

export const TrafficCongestionEvent = mongoose.models.TrafficCongestionEvent || mongoose.model<ITrafficCongestionEvent>('TrafficCongestionEvent', TrafficCongestionEventSchema);
