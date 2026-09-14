import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPredictiveMaintenanceRisk extends Document {
    cityId: Types.ObjectId;
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE';
    assetType: string;
    assetId: Types.ObjectId;
    predictionType: 'FAILURE' | 'DEGRADATION' | 'OVERLOAD' | 'DEMAND_SPIKE' | 'SERVICE_DISRUPTION';
    riskScore: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    predictionHorizon: string; // e.g. 'within 24 hours'
    predictedFailureWindow: { start: Date; end: Date };
    modelName: string;
    modelVersion: string;
    features: Record<string, any>;
    evidence: string[];
    recommendedActions: string[];
    status: 'GENERATED' | 'REVIEWED' | 'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE' | 'ACTION_TAKEN' | 'EXPIRED';
    generatedAt: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PredictiveMaintenanceRiskSchema = new Schema<IPredictiveMaintenanceRisk>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    service: { type: String, required: true },
    assetType: { type: String, required: true },
    assetId: { type: Schema.Types.ObjectId, required: true },
    predictionType: { type: String, required: true },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    predictionHorizon: { type: String, required: true },
    predictedFailureWindow: {
        start: { type: Date },
        end: { type: Date }
    },
    modelName: { type: String, required: true },
    modelVersion: { type: String, required: true },
    features: { type: Schema.Types.Mixed, default: {} },
    evidence: [{ type: String }],
    recommendedActions: [{ type: String }],
    status: { type: String, enum: ['GENERATED', 'REVIEWED', 'CONFIRMED', 'DISMISSED', 'FALSE_POSITIVE', 'ACTION_TAKEN', 'EXPIRED'], default: 'GENERATED' },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

PredictiveMaintenanceRiskSchema.index({ cityId: 1, service: 1, status: 1 });
PredictiveMaintenanceRiskSchema.index({ assetId: 1, status: 1 });
PredictiveMaintenanceRiskSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL if desired or just logical expiring

export const PredictiveMaintenanceRisk = mongoose.model<IPredictiveMaintenanceRisk>('PredictiveMaintenanceRisk', PredictiveMaintenanceRiskSchema);
