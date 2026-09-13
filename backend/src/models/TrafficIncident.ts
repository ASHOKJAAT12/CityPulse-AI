import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficIncident extends Document {
    cityId: mongoose.Types.ObjectId;
    roadId?: mongoose.Types.ObjectId;
    intersectionId?: mongoose.Types.ObjectId;
    type: 'ACCIDENT' | 'BREAKDOWN' | 'ROAD_BLOCK' | 'FLOODING' | 'CONSTRUCTION' | 'SIGNAL_FAILURE' | 'DEBRIS' | 'WRONG_WAY' | 'EMERGENCY' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    reportedBy?: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficIncidentSchema = new Schema<ITrafficIncident>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    roadId: { type: Schema.Types.ObjectId, ref: 'TrafficRoad' },
    intersectionId: { type: Schema.Types.ObjectId, ref: 'TrafficIntersection' },
    type: {
        type: String,
        enum: ['ACCIDENT', 'BREAKDOWN', 'ROAD_BLOCK', 'FLOODING', 'CONSTRUCTION', 'SIGNAL_FAILURE', 'DEBRIS', 'WRONG_WAY', 'EMERGENCY', 'OTHER'],
        required: true
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    status: {
        type: String,
        enum: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date }
}, { timestamps: true });

TrafficIncidentSchema.index({ cityId: 1, status: 1 });
TrafficIncidentSchema.index({ location: '2dsphere' });
TrafficIncidentSchema.index({ cityId: 1, createdAt: -1 });

export const TrafficIncident = mongoose.models.TrafficIncident || mongoose.model<ITrafficIncident>('TrafficIncident', TrafficIncidentSchema);
