import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficRoadwork extends Document {
    cityId: mongoose.Types.ObjectId;
    roadId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: 'ROAD_REPAIR' | 'CONSTRUCTION' | 'RESURFACING' | 'DRAINAGE' | 'UTILITY_WORK' | 'OTHER';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    startAt: Date;
    expectedEndAt: Date;
    completedAt?: Date;
    location?: {
        type: 'Point' | 'LineString';
        coordinates: any[];
    };
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficRoadworkSchema = new Schema<ITrafficRoadwork>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    roadId: { type: Schema.Types.ObjectId, ref: 'TrafficRoad', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['ROAD_REPAIR', 'CONSTRUCTION', 'RESURFACING', 'DRAINAGE', 'UTILITY_WORK', 'OTHER'],
        required: true
    },
    status: {
        type: String,
        enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED'
    },
    startAt: { type: Date, required: true },
    expectedEndAt: { type: Date, required: true },
    completedAt: { type: Date },
    location: {
        type: { type: String, enum: ['Point', 'LineString'] },
        coordinates: { type: Schema.Types.Mixed }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

TrafficRoadworkSchema.index({ cityId: 1, status: 1 });
TrafficRoadworkSchema.index({ cityId: 1, roadId: 1 });
TrafficRoadworkSchema.index({ location: '2dsphere' });

export const TrafficRoadwork = mongoose.models.TrafficRoadwork || mongoose.model<ITrafficRoadwork>('TrafficRoadwork', TrafficRoadworkSchema);
