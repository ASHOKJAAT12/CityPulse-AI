import mongoose, { Schema, Document } from 'mongoose';

export interface IEVChargingStation extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    stationCode: string;
    operator: string;
    description?: string;
    location: {
        type: string;
        coordinates: number[];
    };
    address: string;
    stationType: 'PUBLIC' | 'PRIVATE' | 'COMMERCIAL' | 'HIGHWAY' | 'WORKPLACE' | 'RESIDENTIAL' | 'OTHER';
    status: 'OPERATIONAL' | 'LIMITED' | 'MAINTENANCE' | 'OFFLINE' | 'CLOSED';
    totalConnectors: number;
    availableConnectors: number;
    active: boolean;
    operatingHours?: string;
    contact?: string;
    pricing?: object;
    amenities?: string[];
    metadata?: object;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const EVChargingStationSchema = new Schema(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        stationCode: { type: String, required: true },
        operator: { type: String, required: true },
        description: { type: String },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        },
        address: { type: String, required: true },
        stationType: {
            type: String,
            enum: ['PUBLIC', 'PRIVATE', 'COMMERCIAL', 'HIGHWAY', 'WORKPLACE', 'RESIDENTIAL', 'OTHER'],
            required: true
        },
        status: {
            type: String,
            enum: ['OPERATIONAL', 'LIMITED', 'MAINTENANCE', 'OFFLINE', 'CLOSED'],
            default: 'OFFLINE'
        },
        totalConnectors: { type: Number, default: 0 },
        availableConnectors: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
        operatingHours: { type: String },
        contact: { type: String },
        pricing: { type: Schema.Types.Mixed },
        amenities: [{ type: String }],
        metadata: { type: Schema.Types.Mixed },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

EVChargingStationSchema.index({ cityId: 1, stationCode: 1 }, { unique: true });
EVChargingStationSchema.index({ cityId: 1, location: '2dsphere' });
EVChargingStationSchema.index({ cityId: 1, status: 1 });

export const EVChargingStation = mongoose.model<IEVChargingStation>('EVChargingStation', EVChargingStationSchema);
