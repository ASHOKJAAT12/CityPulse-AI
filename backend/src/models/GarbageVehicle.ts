import mongoose, { Schema, Document } from 'mongoose';
import { VehicleStatus, VehicleType, TrackingStatus } from '../constants/garbage';

export interface IGarbageVehicle extends Document {
    cityId: mongoose.Types.ObjectId;
    vehicleNumber: string;
    vehicleName?: string;
    vehicleType: VehicleType;
    capacity?: number;
    driverId?: mongoose.Types.ObjectId;
    status: VehicleStatus;
    active: boolean;
    notes?: string;
    // Phase 5 — Live Tracking
    currentLocation?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    lastLocationAt?: Date;
    trackingStatus: TrackingStatus;
    currentRouteId?: mongoose.Types.ObjectId;
    currentStopId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const garbageVehicleSchema = new Schema<IGarbageVehicle>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        vehicleNumber: { type: String, required: true, trim: true },
        vehicleName: { type: String, trim: true },
        vehicleType: {
            type: String,
            enum: Object.values(VehicleType),
            default: VehicleType.OTHER,
        },
        capacity: { type: Number },
        driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
        status: {
            type: String,
            enum: Object.values(VehicleStatus),
            default: VehicleStatus.AVAILABLE,
        },
        active: { type: Boolean, default: true },
        notes: { type: String },
        // Phase 5 — Live Tracking
        currentLocation: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] },
        },
        lastLocationAt: { type: Date },
        trackingStatus: {
            type: String,
            enum: Object.values(TrackingStatus),
            default: TrackingStatus.NOT_TRACKING,
        },
        currentRouteId: { type: Schema.Types.ObjectId, ref: 'GarbageRoute' },
        currentStopId: { type: Schema.Types.ObjectId, ref: 'GarbageRouteStop' },
    },
    { timestamps: true }
);

// Indexes
garbageVehicleSchema.index({ cityId: 1 });
garbageVehicleSchema.index({ cityId: 1, vehicleNumber: 1 }, { unique: true });
garbageVehicleSchema.index({ status: 1 });
garbageVehicleSchema.index({ driverId: 1 });
garbageVehicleSchema.index({ trackingStatus: 1 });
garbageVehicleSchema.index({ cityId: 1, trackingStatus: 1 });
garbageVehicleSchema.index({ currentRouteId: 1 });
garbageVehicleSchema.index({ currentLocation: '2dsphere' }, { sparse: true });

export const GarbageVehicle = mongoose.model<IGarbageVehicle>(
    'GarbageVehicle',
    garbageVehicleSchema
);
