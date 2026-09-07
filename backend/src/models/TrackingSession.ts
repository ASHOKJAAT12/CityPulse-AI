import mongoose, { Schema, Document } from 'mongoose';
import { TrackingSessionStatus } from '../constants/garbage';

/**
 * TrackingSession — records when a vehicle is actively being tracked.
 *
 * Business rules:
 *   - Only one ACTIVE session per vehicle at a time.
 *   - Sessions are ENDED explicitly via stop-tracking or detected via stale timeout.
 *   - Do not delete sessions; they form an audit trail.
 */
export interface ITrackingSession extends Document {
    vehicleId: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId;
    cityId: mongoose.Types.ObjectId;
    routeId: mongoose.Types.ObjectId;
    status: TrackingSessionStatus;
    startedAt: Date;
    endedAt?: Date;
    lastLocationAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const trackingSessionSchema = new Schema<ITrackingSession>(
    {
        vehicleId: { type: Schema.Types.ObjectId, ref: 'GarbageVehicle', required: true },
        driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        routeId: { type: Schema.Types.ObjectId, ref: 'GarbageRoute', required: true },
        status: {
            type: String,
            enum: Object.values(TrackingSessionStatus),
            default: TrackingSessionStatus.ACTIVE,
        },
        startedAt: { type: Date, required: true, default: Date.now },
        endedAt: { type: Date },
        lastLocationAt: { type: Date },
    },
    { timestamps: true }
);

// Indexes
trackingSessionSchema.index({ vehicleId: 1, status: 1 });
trackingSessionSchema.index({ cityId: 1 });
trackingSessionSchema.index({ cityId: 1, status: 1 });
trackingSessionSchema.index({ routeId: 1 });
trackingSessionSchema.index({ startedAt: -1 });

export const TrackingSession = mongoose.model<ITrackingSession>(
    'TrackingSession',
    trackingSessionSchema
);
