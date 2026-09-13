import mongoose, { Schema, Document } from 'mongoose';

export interface IEVChargingSession extends Document {
    cityId: mongoose.Types.ObjectId;
    stationId: mongoose.Types.ObjectId;
    connectorId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    sessionStatus: 'CREATED' | 'STARTING' | 'CHARGING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    startedAt?: Date;
    endedAt?: Date;
    energyConsumedKWh: number;
    durationSeconds: number;
    startMeterValue: number;
    endMeterValue: number;
    cost: number;
    metadata?: object;
    createdAt: Date;
    updatedAt: Date;
}

const EVChargingSessionSchema = new Schema(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        stationId: { type: Schema.Types.ObjectId, ref: 'EVChargingStation', required: true },
        connectorId: { type: Schema.Types.ObjectId, ref: 'EVConnector', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        sessionStatus: {
            type: String,
            enum: ['CREATED', 'STARTING', 'CHARGING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'],
            default: 'CREATED'
        },
        startedAt: { type: Date },
        endedAt: { type: Date },
        energyConsumedKWh: { type: Number, default: 0 },
        durationSeconds: { type: Number, default: 0 },
        startMeterValue: { type: Number, default: 0 },
        endMeterValue: { type: Number, default: 0 },
        cost: { type: Number, default: 0 },
        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

EVChargingSessionSchema.index({ cityId: 1, stationId: 1 });
EVChargingSessionSchema.index({ connectorId: 1 });
EVChargingSessionSchema.index({ userId: 1, createdAt: -1 });

export const EVChargingSession = mongoose.model<IEVChargingSession>('EVChargingSession', EVChargingSessionSchema);
