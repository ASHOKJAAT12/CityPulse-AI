import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightAsset extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    assetCode: string;
    assetType: 'LIGHT_POLE' | 'LED_FIXTURE' | 'CONTROL_PANEL' | 'STREETLIGHT_CONTROLLER' | 'SMART_GATEWAY' | 'OTHER';
    description?: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    address?: string;
    zoneId?: mongoose.Types.ObjectId;
    poleNumber?: string;
    status: 'ON' | 'OFF' | 'DIMMED' | 'FAULT' | 'OFFLINE' | 'MAINTENANCE' | 'UNKNOWN';
    active: boolean;
    installationDate?: Date;
    manufacturer?: string;
    assetModel?: string;
    wattage?: number;
    metadata?: Record<string, any>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const StreetlightAssetSchema = new Schema<IStreetlightAsset>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    name: { type: String, required: true },
    assetCode: { type: String, required: true },
    assetType: {
        type: String,
        enum: ['LIGHT_POLE', 'LED_FIXTURE', 'CONTROL_PANEL', 'STREETLIGHT_CONTROLLER', 'SMART_GATEWAY', 'OTHER'],
        required: true
    },
    description: { type: String },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    address: { type: String },
    zoneId: { type: Schema.Types.ObjectId, ref: 'StreetlightZone' },
    poleNumber: { type: String },
    status: {
        type: String,
        enum: ['ON', 'OFF', 'DIMMED', 'FAULT', 'OFFLINE', 'MAINTENANCE', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    active: { type: Boolean, default: true },
    installationDate: { type: Date },
    manufacturer: { type: String },
    assetModel: { type: String },
    wattage: { type: Number },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

String(StreetlightAssetSchema.index({ cityId: 1, assetCode: 1 }, { unique: true }));
StreetlightAssetSchema.index({ location: '2dsphere' });
StreetlightAssetSchema.index({ cityId: 1, status: 1 });
StreetlightAssetSchema.index({ zoneId: 1 });

export const StreetlightAsset = mongoose.model<IStreetlightAsset>('StreetlightAsset', StreetlightAssetSchema);
