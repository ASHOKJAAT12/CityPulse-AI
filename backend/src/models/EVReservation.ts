import mongoose, { Schema, Document } from 'mongoose';

export interface IEVReservation extends Document {
    cityId: mongoose.Types.ObjectId;
    stationId: mongoose.Types.ObjectId;
    connectorId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    createdAt: Date;
    updatedAt: Date;
}

const EVReservationSchema = new Schema(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        stationId: { type: Schema.Types.ObjectId, ref: 'EVChargingStation', required: true },
        connectorId: { type: Schema.Types.ObjectId, ref: 'EVConnector', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
            default: 'PENDING'
        }
    },
    { timestamps: true }
);

EVReservationSchema.index({ cityId: 1, stationId: 1 });
EVReservationSchema.index({ connectorId: 1, startTime: 1, endTime: 1 });
EVReservationSchema.index({ userId: 1, status: 1 });

// Ensure end time is strictly greater than start time
EVReservationSchema.pre('save', function (next) {
    if (this.endTime <= this.startTime) {
        return next(new Error('EVReservation validation failed: endTime must be strictly greater than startTime.'));
    }
    next();
});

export const EVReservation = mongoose.model<IEVReservation>('EVReservation', EVReservationSchema);
