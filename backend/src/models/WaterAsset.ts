import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterAsset extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    assetType: 'WATER_TANK' | 'RESERVOIR' | 'PUMPING_STATION' | 'WATER_TREATMENT_PLANT' | 'PIPELINE' | 'VALVE' | 'DISTRIBUTION_POINT' | 'SENSOR' | 'OTHER';
    assetCode: string;
    description?: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    address?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FAULT' | 'UNKNOWN';
    capacity?: number;
    active: boolean;
    metadata?: Record<string, unknown>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const waterAssetSchema = new Schema<IWaterAsset>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        assetType: {
            type: String,
            enum: ['WATER_TANK', 'RESERVOIR', 'PUMPING_STATION', 'WATER_TREATMENT_PLANT', 'PIPELINE', 'VALVE', 'DISTRIBUTION_POINT', 'SENSOR', 'OTHER'],
            required: true
        },
        assetCode: { type: String, required: true },
        description: { type: String },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
        address: { type: String },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULT', 'UNKNOWN'],
            default: 'ACTIVE'
        },
        capacity: { type: Number },
        active: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

// Indexes
waterAssetSchema.index({ cityId: 1, status: 1 });
waterAssetSchema.index({ cityId: 1, assetType: 1 });
waterAssetSchema.index({ location: '2dsphere' });
waterAssetSchema.index({ assetCode: 1 });

export const WaterAsset = mongoose.model<IWaterAsset>('WaterAsset', waterAssetSchema);
