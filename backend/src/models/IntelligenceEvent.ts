import mongoose, { Document, Schema } from 'mongoose';

export interface IIntelligenceEvent extends Document {
    cityId: mongoose.Types.ObjectId;
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE' | 'CITIZEN_REPORT' | 'CROSS_SERVICE';
    eventType: 'ANOMALY' | 'PREDICTION' | 'CORRELATION' | 'RISK' | 'SERVICE_DEGRADATION' | 'OPERATIONAL_WARNING';
    sourceType: string;
    sourceId?: mongoose.Types.ObjectId;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    confidence: number;
    title: string;
    summary: string;
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    detectedAt: Date;
    validUntil?: Date;
    status: 'DETECTED' | 'UNDER_REVIEW' | 'ACKNOWLEDGED' | 'ACTION_RECOMMENDED' | 'RESOLVED' | 'DISMISSED';
    features: Map<string, any>;
    evidence: string[];
    recommendedActions: string[];
    createdAt: Date;
    updatedAt: Date;
}

const intelligenceEventSchema = new Schema<IIntelligenceEvent>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        service: {
            type: String,
            required: true,
            enum: ['WATER', 'ELECTRICITY', 'TRAFFIC', 'EV', 'STREETLIGHT', 'GARBAGE', 'CITIZEN_REPORT', 'CROSS_SERVICE']
        },
        eventType: {
            type: String,
            required: true,
            enum: ['ANOMALY', 'PREDICTION', 'CORRELATION', 'RISK', 'SERVICE_DEGRADATION', 'OPERATIONAL_WARNING']
        },
        sourceType: { type: String, required: true },
        sourceId: { type: Schema.Types.ObjectId, index: true },
        severity: {
            type: String,
            required: true,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        },
        riskScore: { type: Number, required: true, min: 0, max: 100 },
        confidence: { type: Number, required: true, min: 0, max: 100 },
        title: { type: String, required: true },
        summary: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        detectedAt: { type: Date, required: true, default: Date.now, index: true },
        validUntil: { type: Date },
        status: {
            type: String,
            required: true,
            enum: ['DETECTED', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'ACTION_RECOMMENDED', 'RESOLVED', 'DISMISSED'],
            default: 'DETECTED',
            index: true
        },
        features: { type: Map, of: Schema.Types.Mixed, default: {} },
        evidence: [{ type: String }],
        recommendedActions: [{ type: String }]
    },
    { timestamps: true }
);

intelligenceEventSchema.index({ cityId: 1, service: 1, createdAt: -1 });
intelligenceEventSchema.index({ cityId: 1, status: 1, createdAt: -1 });
intelligenceEventSchema.index({ cityId: 1, location: '2dsphere' });
intelligenceEventSchema.index({ cityId: 1, severity: 1, createdAt: -1 });

export const IntelligenceEvent = mongoose.models.IntelligenceEvent || mongoose.model<IIntelligenceEvent>('IntelligenceEvent', intelligenceEventSchema);
