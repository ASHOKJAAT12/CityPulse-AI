import mongoose, { Document, Schema } from 'mongoose';

export interface ITrafficSignal extends Document {
    cityId: mongoose.Types.ObjectId;
    intersectionId: mongoose.Types.ObjectId;
    signalCode: string;
    status: 'OPERATIONAL' | 'WARNING' | 'FAULT' | 'OFFLINE' | 'MAINTENANCE';
    mode: 'AUTO' | 'MANUAL' | 'FLASHING' | 'OFF';
    cycleDuration?: number; // Total cycle length in seconds
    lastUpdatedAt?: Date;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const TrafficSignalSchema = new Schema<ITrafficSignal>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    intersectionId: { type: Schema.Types.ObjectId, ref: 'TrafficIntersection', required: true },
    signalCode: { type: String, required: true },
    status: {
        type: String,
        enum: ['OPERATIONAL', 'WARNING', 'FAULT', 'OFFLINE', 'MAINTENANCE'],
        default: 'OPERATIONAL'
    },
    mode: {
        type: String,
        enum: ['AUTO', 'MANUAL', 'FLASHING', 'OFF'],
        default: 'AUTO'
    },
    cycleDuration: { type: Number, min: 0 },
    lastUpdatedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

TrafficSignalSchema.index({ cityId: 1, signalCode: 1 }, { unique: true });
TrafficSignalSchema.index({ cityId: 1, intersectionId: 1 });
TrafficSignalSchema.index({ cityId: 1, status: 1 });

export const TrafficSignal = mongoose.models.TrafficSignal || mongoose.model<ITrafficSignal>('TrafficSignal', TrafficSignalSchema);
