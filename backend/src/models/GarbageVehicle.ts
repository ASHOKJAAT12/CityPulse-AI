import mongoose, { Schema, Document } from 'mongoose';
import { VehicleStatus, VehicleType } from '../constants/garbage';

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
    },
    { timestamps: true }
);

// Indexes
garbageVehicleSchema.index({ cityId: 1 });
garbageVehicleSchema.index({ cityId: 1, vehicleNumber: 1 }, { unique: true });
garbageVehicleSchema.index({ status: 1 });
garbageVehicleSchema.index({ driverId: 1 });

export const GarbageVehicle = mongoose.model<IGarbageVehicle>(
    'GarbageVehicle',
    garbageVehicleSchema
);
