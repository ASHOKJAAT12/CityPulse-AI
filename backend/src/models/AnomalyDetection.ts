import mongoose, { Document, Schema } from 'mongoose';

export interface IAnomalyDetection extends Document {
    cityId: mongoose.Types.ObjectId;
    service: string;
    sourceType: string;
    sourceId?: mongoose.Types.ObjectId;
    metric: string;
    observedValue: number;
    expectedValue?: number;
    deviation?: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    method: 'THRESHOLD' | 'MOVING_AVERAGE' | 'RATE_OF_CHANGE' | 'Z_SCORE' | 'BASELINE_COMPARISON' | 'RULE_CORRELATION';
    windowStart?: Date;
    windowEnd?: Date;
    detectedAt: Date;
    status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
    evidence: string[];
    createdAt: Date;
    updatedAt: Date;
}

const anomalyDetectionSchema = new Schema<IAnomalyDetection>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        service: { type: String, required: true },
        sourceType: { type: String, required: true },
        sourceId: { type: Schema.Types.ObjectId, index: true },
        metric: { type: String, required: true },
        observedValue: { type: Number, required: true },
        expectedValue: { type: Number },
        deviation: { type: Number },
        severity: {
            type: String,
            required: true,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        },
        confidence: { type: Number, required: true, min: 0, max: 100 },
        method: {
            type: String,
            required: true,
            enum: ['THRESHOLD', 'MOVING_AVERAGE', 'RATE_OF_CHANGE', 'Z_SCORE', 'BASELINE_COMPARISON', 'RULE_CORRELATION']
        },
        windowStart: { type: Date },
        windowEnd: { type: Date },
        detectedAt: { type: Date, required: true, default: Date.now },
        status: {
            type: String,
            required: true,
            enum: ['ACTIVE', 'RESOLVED', 'DISMISSED'],
            default: 'ACTIVE'
        },
        evidence: [{ type: String }]
    },
    { timestamps: true }
);

anomalyDetectionSchema.index({ cityId: 1, service: 1, detectedAt: -1 });

export const AnomalyDetection = mongoose.models.AnomalyDetection || mongoose.model<IAnomalyDetection>('AnomalyDetection', anomalyDetectionSchema);
