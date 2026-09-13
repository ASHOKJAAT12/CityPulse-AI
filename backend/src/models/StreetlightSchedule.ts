import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightSchedule extends Document {
    cityId: mongoose.Types.ObjectId;
    zoneId: mongoose.Types.ObjectId;
    name: string;
    daysOfWeek: number[]; // 0-6 where 0 is Sunday
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    brightnessPercentage: number;
    mode: 'ON' | 'OFF' | 'DIMMED' | 'AUTO';
    active: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const StreetlightScheduleSchema = new Schema<IStreetlightSchedule>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    zoneId: { type: Schema.Types.ObjectId, ref: 'StreetlightZone', required: true, index: true },
    name: { type: String, required: true },
    daysOfWeek: { type: [Number], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    brightnessPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    mode: { type: String, enum: ['ON', 'OFF', 'DIMMED', 'AUTO'], required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const StreetlightSchedule = mongoose.model<IStreetlightSchedule>('StreetlightSchedule', StreetlightScheduleSchema);
