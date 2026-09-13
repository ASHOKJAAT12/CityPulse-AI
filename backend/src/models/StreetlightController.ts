import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightController extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
    controllerCode: string;
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'FAULT' | 'MAINTENANCE';
    communicationStatus: 'CONNECTED' | 'DISCONNECTED';
    lastSeenAt?: Date;
    firmwareVersion?: string;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const StreetlightControllerSchema = new Schema<IStreetlightController>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: 'StreetlightAsset', required: true },
    controllerCode: { type: String, required: true },
    status: {
        type: String,
        enum: ['ONLINE', 'OFFLINE', 'WARNING', 'FAULT', 'MAINTENANCE'],
        default: 'OFFLINE'
    },
    communicationStatus: {
        type: String,
        enum: ['CONNECTED', 'DISCONNECTED'],
        default: 'DISCONNECTED'
    },
    lastSeenAt: { type: Date },
    firmwareVersion: { type: String },
    active: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

String(StreetlightControllerSchema.index({ cityId: 1, controllerCode: 1 }, { unique: true }));
StreetlightControllerSchema.index({ assetId: 1 });
StreetlightControllerSchema.index({ cityId: 1, status: 1 });

export const StreetlightController = mongoose.model<IStreetlightController>('StreetlightController', StreetlightControllerSchema);
