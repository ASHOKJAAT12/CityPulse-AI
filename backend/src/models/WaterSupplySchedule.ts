import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterSupplySchedule extends Document {
    cityId: mongoose.Types.ObjectId;
    areaName: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    status: 'SCHEDULED' | 'ONGOING' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
    notes?: string;
    active: boolean;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const waterSupplyScheduleSchema = new Schema<IWaterSupplySchedule>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        areaName: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] },
        },
        dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6
        },
        startTime: { type: String, required: true }, // Format validations shouldn't be only in controller, basic regex
        endTime: { type: String, required: true },
        status: {
            type: String,
            enum: ['SCHEDULED', 'ONGOING', 'DELAYED', 'CANCELLED', 'COMPLETED'],
            default: 'SCHEDULED'
        },
        notes: { type: String },
        active: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Indexes
waterSupplyScheduleSchema.index({ cityId: 1, dayOfWeek: 1 });
waterSupplyScheduleSchema.index({ cityId: 1, status: 1 });
waterSupplyScheduleSchema.index({ location: '2dsphere' });

export const WaterSupplySchedule = mongoose.model<IWaterSupplySchedule>('WaterSupplySchedule', waterSupplyScheduleSchema);
