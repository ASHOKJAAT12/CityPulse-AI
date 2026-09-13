import mongoose, { Schema, Document } from 'mongoose';

export interface IElectricityAsset extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    assetCode: string;
    assetType: 'POWER_PLANT' | 'SUBSTATION' | 'TRANSFORMER' | 'FEEDER' | 'POLE' | 'ELECTRIC_LINE' | 'SMART_METER' | 'SWITCH' | 'DISTRIBUTION_PANEL' | 'GENERATOR' | 'EV_POWER_UNIT' | 'OTHER';
    description?: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    address?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FAULT' | 'OFFLINE' | 'UNKNOWN';
    capacity?: number;
    voltageRating?: number;
    active: boolean;
    metadata?: Record<string, unknown>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const electricityAssetSchema = new Schema<IElectricityAsset>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        assetCode: { type: String, required: true },
        assetType: {
            type: String,
            enum: ['POWER_PLANT', 'SUBSTATION', 'TRANSFORMER', 'FEEDER', 'POLE', 'ELECTRIC_LINE', 'SMART_METER', 'SWITCH', 'DISTRIBUTION_PANEL', 'GENERATOR', 'EV_POWER_UNIT', 'OTHER'],
            required: true
        },
        description: { type: String },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
        address: { type: String },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULT', 'OFFLINE', 'UNKNOWN'],
            default: 'ACTIVE'
        },
        capacity: { type: Number },
        voltageRating: { type: Number },
        active: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

// Indexes
electricityAssetSchema.index({ cityId: 1, status: 1 });
electricityAssetSchema.index({ cityId: 1, assetType: 1 });
electricityAssetSchema.index({ location: '2dsphere' });
electricityAssetSchema.index({ assetCode: 1 });

export const ElectricityAsset = mongoose.model<IElectricityAsset>('ElectricityAsset', electricityAssetSchema);
