import mongoose, { Schema, Document } from 'mongoose';

export interface IEVStationReading extends Document {
    cityId: mongoose.Types.ObjectId;
    stationId: mongoose.Types.ObjectId;
    connectorId?: mongoose.Types.ObjectId;
    powerKW: number;
    energyKWh: number;
    voltage: number;
    current: number;
    temperature: number;
    recordedAt: Date;
    source: 'STATION' | 'ADMIN' | 'API' | 'SIMULATOR';
    quality?: string;
    metadata?: object;
}

const EVStationReadingSchema = new Schema(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        stationId: { type: Schema.Types.ObjectId, ref: 'EVChargingStation', required: true },
        connectorId: { type: Schema.Types.ObjectId, ref: 'EVConnector' },
        powerKW: { type: Number, required: true },
        energyKWh: { type: Number, required: true },
        voltage: { type: Number, required: true },
        current: { type: Number, required: true },
        temperature: { type: Number, required: true },
        recordedAt: { type: Date, required: true, default: Date.now },
        source: {
            type: String,
            enum: ['STATION', 'ADMIN', 'API', 'SIMULATOR'],
            required: true
        },
        quality: { type: String },
        metadata: { type: Schema.Types.Mixed }
    },
    { timeseries: { timeField: 'recordedAt', metaField: 'stationId', granularity: 'minutes' } }
);

EVStationReadingSchema.index({ cityId: 1, stationId: 1 });
EVStationReadingSchema.index({ stationId: 1, recordedAt: -1 });

export const EVStationReading = mongoose.model<IEVStationReading>('EVStationReading', EVStationReadingSchema);
