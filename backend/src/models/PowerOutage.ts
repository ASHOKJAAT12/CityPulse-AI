import mongoose, { Schema, Document } from 'mongoose';

export interface IPowerOutage extends Document {
    cityId: mongoose.Types.ObjectId;
    assetId?: mongoose.Types.ObjectId;
    feederId?: mongoose.Types.ObjectId;
    areaName: string;
    title: string;
    description: string;
    cause?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'SCHEDULED' | 'ACTIVE' | 'RESTORATION_IN_PROGRESS' | 'RESTORED' | 'CANCELLED';
    startedAt: Date;
    estimatedRestorationAt?: Date;
    actualRestorationAt?: Date;
    affectedAreas: string[];
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    createdBy: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const powerOutageSchema = new Schema<IPowerOutage>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        assetId: { type: Schema.Types.ObjectId, ref: 'ElectricityAsset' },
        feederId: { type: Schema.Types.ObjectId, ref: 'ElectricityAsset' },
        areaName: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        cause: { type: String },
        severity: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            required: true
        },
        status: {
            type: String,
            enum: ['SCHEDULED', 'ACTIVE', 'RESTORATION_IN_PROGRESS', 'RESTORED', 'CANCELLED'],
            default: 'ACTIVE'
        },
        startedAt: { type: Date, required: true },
        estimatedRestorationAt: { type: Date },
        actualRestorationAt: { type: Date },
        affectedAreas: [{ type: String }],
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

powerOutageSchema.index({ cityId: 1, status: 1 });
powerOutageSchema.index({ cityId: 1, startedAt: -1 });
powerOutageSchema.index({ location: '2dsphere' });

export const PowerOutage = mongoose.model<IPowerOutage>('PowerOutage', powerOutageSchema);
