import mongoose, { Schema, Document } from 'mongoose';

export interface IEVConnector extends Document {
    cityId: mongoose.Types.ObjectId;
    stationId: mongoose.Types.ObjectId;
    connectorCode: string;
    connectorType: 'TYPE_2' | 'CCS' | 'CHAdeMO' | 'GB_T' | 'TESLA' | 'OTHER';
    powerType: 'AC' | 'DC';
    maxPowerKW: number;
    voltage: number;
    current: number;
    status: 'AVAILABLE' | 'CHARGING' | 'RESERVED' | 'FAULT' | 'OFFLINE' | 'MAINTENANCE';
    availability: boolean;
    lastUpdatedAt: Date;
    active: boolean;
    metadata?: object;
    createdAt: Date;
    updatedAt: Date;
}

const EVConnectorSchema = new Schema(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        stationId: { type: Schema.Types.ObjectId, ref: 'EVChargingStation', required: true },
        connectorCode: { type: String, required: true },
        connectorType: {
            type: String,
            enum: ['TYPE_2', 'CCS', 'CHAdeMO', 'GB_T', 'TESLA', 'OTHER'],
            required: true
        },
        powerType: {
            type: String,
            enum: ['AC', 'DC'],
            required: true
        },
        maxPowerKW: { type: Number, required: true },
        voltage: { type: Number, required: true },
        current: { type: Number, required: true },
        status: {
            type: String,
            enum: ['AVAILABLE', 'CHARGING', 'RESERVED', 'FAULT', 'OFFLINE', 'MAINTENANCE'],
            default: 'OFFLINE'
        },
        availability: { type: Boolean, default: false },
        lastUpdatedAt: { type: Date, default: Date.now },
        active: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

EVConnectorSchema.index({ cityId: 1, stationId: 1 });
EVConnectorSchema.index({ cityId: 1, connectorCode: 1 }, { unique: true });
EVConnectorSchema.index({ connectorId: 1, status: 1 });

export const EVConnector = mongoose.model<IEVConnector>('EVConnector', EVConnectorSchema);
