import mongoose, { Schema, Document } from 'mongoose';
import { DriverStatus } from '../constants/garbage';

export interface IDriver extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    mobile: string;
    employeeId?: string;
    status: DriverStatus;
    createdAt: Date;
    updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        employeeId: { type: String },
        status: {
            type: String,
            enum: Object.values(DriverStatus),
            default: DriverStatus.ACTIVE,
        },
    },
    { timestamps: true }
);

// Indexes
driverSchema.index({ cityId: 1 });
driverSchema.index({ cityId: 1, mobile: 1 }, { unique: true });
driverSchema.index({ status: 1 });

export const Driver = mongoose.model<IDriver>('Driver', driverSchema);
