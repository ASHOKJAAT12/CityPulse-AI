import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenancePlan extends Document {
    cityId: mongoose.Types.ObjectId;
    service: 'GARBAGE' | 'WATER' | 'ELECTRICITY' | 'EV' | 'TRAFFIC' | 'STREETLIGHT' | 'EMERGENCY' | 'GENERAL';
    assetId: mongoose.Types.ObjectId;
    recommendedAction: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    predictedRisk: number;
    suggestedWindow: {
        start: Date;
        end: Date;
    };
    resourceRequirement: Record<string, any>;
    status: 'RECOMMENDED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
    createdAt: Date;
    updatedAt: Date;
}

const maintenancePlanSchema = new Schema<IMaintenancePlan>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        service: {
            type: String,
            enum: ['GARBAGE', 'WATER', 'ELECTRICITY', 'EV', 'TRAFFIC', 'STREETLIGHT', 'EMERGENCY', 'GENERAL'],
            required: true
        },
        assetId: { type: Schema.Types.ObjectId, required: true },
        recommendedAction: { type: String, required: true },
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            required: true
        },
        reason: { type: String, required: true },
        predictedRisk: { type: Number, min: 0, max: 100, required: true },
        suggestedWindow: {
            start: { type: Date, required: true },
            end: { type: Date, required: true }
        },
        resourceRequirement: { type: Schema.Types.Mixed, default: {} },
        status: {
            type: String,
            enum: ['RECOMMENDED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED'],
            default: 'RECOMMENDED'
        }
    },
    { timestamps: true }
);

maintenancePlanSchema.index({ cityId: 1, status: 1 });
maintenancePlanSchema.index({ cityId: 1, service: 1, 'suggestedWindow.start': 1 });

export const MaintenancePlan = mongoose.model<IMaintenancePlan>('MaintenancePlan', maintenancePlanSchema);
