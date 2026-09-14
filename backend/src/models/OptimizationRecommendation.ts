import mongoose, { Schema, Document } from 'mongoose';

export interface IOptimizationRecommendation extends Document {
    cityId: mongoose.Types.ObjectId;
    optimizationType: 'GARBAGE_ROUTE' | 'WATER_SCHEDULE' | 'ELECTRICITY_LOAD' | 'EV_CAPACITY' | 'TRAFFIC_ROUTE' | 'STREETLIGHT_ENERGY' | 'EMERGENCY_DISPATCH' | 'OTHER';
    service: 'GARBAGE' | 'WATER' | 'ELECTRICITY' | 'EV' | 'TRAFFIC' | 'STREETLIGHT' | 'EMERGENCY' | 'GENERAL';
    title: string;
    summary: string;
    objective: string;
    baseline: Record<string, any>;
    recommendedPlan: Record<string, any>;
    expectedImpact: Record<string, any>;
    constraints: Record<string, any>;
    evidence: Record<string, any>;
    confidence: number;
    score: number;
    status: 'GENERATED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'APPLIED' | 'EXPIRED';
    createdBy: mongoose.Types.ObjectId;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    appliedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const optimizationRecommendationSchema = new Schema<IOptimizationRecommendation>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        optimizationType: { type: String, required: true },
        service: {
            type: String,
            enum: ['GARBAGE', 'WATER', 'ELECTRICITY', 'EV', 'TRAFFIC', 'STREETLIGHT', 'EMERGENCY', 'GENERAL'],
            required: true
        },
        title: { type: String, required: true },
        summary: { type: String, required: true },
        objective: { type: String, required: true },
        baseline: { type: Schema.Types.Mixed, required: true },
        recommendedPlan: { type: Schema.Types.Mixed, required: true },
        expectedImpact: { type: Schema.Types.Mixed, default: {} },
        constraints: { type: Schema.Types.Mixed, default: {} },
        evidence: { type: Schema.Types.Mixed, default: {} },
        confidence: { type: Number, min: 0, max: 100, default: 0 },
        score: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['GENERATED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'APPLIED', 'EXPIRED'],
            default: 'GENERATED'
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        appliedAt: { type: Date }
    },
    { timestamps: true }
);

optimizationRecommendationSchema.index({ cityId: 1, service: 1, createdAt: -1 });
optimizationRecommendationSchema.index({ cityId: 1, status: 1 });
optimizationRecommendationSchema.index({ cityId: 1, optimizationType: 1 });

export const OptimizationRecommendation = mongoose.model<IOptimizationRecommendation>('OptimizationRecommendation', optimizationRecommendationSchema);
