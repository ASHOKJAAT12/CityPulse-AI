import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightMaintenance extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId?: mongoose.Types.ObjectId;
    controllerId?: mongoose.Types.ObjectId;
    zoneId?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledStart: Date;
    scheduledEnd: Date;
    completedAt?: Date;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const StreetlightMaintenanceSchema = new Schema<IStreetlightMaintenance>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: 'StreetlightAsset' },
    controllerId: { type: Schema.Types.ObjectId, ref: 'StreetlightController' },
    zoneId: { type: Schema.Types.ObjectId, ref: 'StreetlightZone' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'], required: true },
    status: {
        type: String,
        enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED'
    },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    completedAt: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

StreetlightMaintenanceSchema.index({ cityId: 1, status: 1 });
StreetlightMaintenanceSchema.index({ assetId: 1 });
StreetlightMaintenanceSchema.index({ zoneId: 1 });

export const StreetlightMaintenance = mongoose.model<IStreetlightMaintenance>('StreetlightMaintenance', StreetlightMaintenanceSchema);
