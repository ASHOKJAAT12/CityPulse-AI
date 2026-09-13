import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficRoadClosure extends Document {
    cityId: mongoose.Types.ObjectId;
    roadId: mongoose.Types.ObjectId;
    reason: string;
    description: string;
    startAt: Date;
    expectedEndAt: Date;
    actualEndAt?: Date;
    status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    affectedArea?: string;
    detourDescription?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficRoadClosureSchema = new Schema<ITrafficRoadClosure>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    roadId: { type: Schema.Types.ObjectId, ref: 'TrafficRoad', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    startAt: { type: Date, required: true },
    expectedEndAt: { type: Date, required: true },
    actualEndAt: { type: Date },
    status: {
        type: String,
        enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED'
    },
    affectedArea: { type: String },
    detourDescription: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

TrafficRoadClosureSchema.index({ cityId: 1, status: 1 });
TrafficRoadClosureSchema.index({ cityId: 1, roadId: 1 });
TrafficRoadClosureSchema.index({ startAt: -1 });

export const TrafficRoadClosure = mongoose.models.TrafficRoadClosure || mongoose.model<ITrafficRoadClosure>('TrafficRoadClosure', TrafficRoadClosureSchema);
