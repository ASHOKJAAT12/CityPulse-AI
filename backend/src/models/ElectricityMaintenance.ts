import mongoose, { Schema, Document } from 'mongoose';

export interface IElectricityMaintenance extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId: mongoose.Types.ObjectId;
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

const electricityMaintenanceSchema = new Schema<IElectricityMaintenance>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'ElectricityAsset', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: {
            type: String,
            enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'],
            required: true
        },
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
    },
    { timestamps: true }
);

electricityMaintenanceSchema.index({ cityId: 1, status: 1 });
electricityMaintenanceSchema.index({ assetId: 1 });

export const ElectricityMaintenance = mongoose.model<IElectricityMaintenance>('ElectricityMaintenance', electricityMaintenanceSchema);
