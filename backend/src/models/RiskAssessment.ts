import mongoose, { Document, Schema } from 'mongoose';

export interface IRiskAssessment extends Document {
    cityId: mongoose.Types.ObjectId;
    service: string;
    sourceType: string;
    sourceId?: mongoose.Types.ObjectId;
    riskType: string;
    riskScore: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    impactScore: number;
    likelihoodScore: number;
    timeHorizon?: string;
    affectedArea?: {
        type: 'Polygon';
        coordinates: number[][][]; // GeoJSON representation
    } | {
        type: 'Point';
        coordinates: [number, number];
    };
    evidence: string[];
    recommendedActions: string[];
    status: 'ACTIVE' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';
    createdAt: Date;
    updatedAt: Date;
}

const riskAssessmentSchema = new Schema<IRiskAssessment>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        service: { type: String, required: true },
        sourceType: { type: String, required: true },
        sourceId: { type: Schema.Types.ObjectId, index: true },
        riskType: { type: String, required: true },
        riskScore: { type: Number, required: true, min: 0, max: 100 },
        severity: {
            type: String,
            required: true,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        },
        confidence: { type: Number, required: true, min: 0, max: 100 },
        impactScore: { type: Number, required: true, min: 0, max: 100 },
        likelihoodScore: { type: Number, required: true, min: 0, max: 100 },
        timeHorizon: { type: String },
        affectedArea: { type: Schema.Types.Mixed }, // Either Point or Polygon GeoJSON
        evidence: [{ type: String }],
        recommendedActions: [{ type: String }],
        status: {
            type: String,
            required: true,
            enum: ['ACTIVE', 'MITIGATED', 'ACCEPTED', 'CLOSED'],
            default: 'ACTIVE'
        }
    },
    { timestamps: true }
);

riskAssessmentSchema.index({ cityId: 1, service: 1, riskScore: -1 });

export const RiskAssessment = mongoose.models.RiskAssessment || mongoose.model<IRiskAssessment>('RiskAssessment', riskAssessmentSchema);
