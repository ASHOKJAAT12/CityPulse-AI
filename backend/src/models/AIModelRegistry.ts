import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIModelRegistry extends Document {
    name: string;
    version: string;
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE';
    predictionType: 'FAILURE' | 'DEGRADATION' | 'OVERLOAD' | 'DEMAND_SPIKE' | 'SERVICE_DISRUPTION';
    method: 'BASELINE' | 'STATISTICAL' | 'TIME_SERIES' | 'CLASSIFICATION' | 'RULE_BASED';
    status: 'DEVELOPMENT' | 'TESTING' | 'ACTIVE' | 'RETIRED';
    parameters: Record<string, any>;
    featureSchema: Record<string, any>;
    trainedAt?: Date;
    evaluationPeriod: { start: Date; end: Date };
    metrics: {
        precision?: number;
        recall?: number;
        f1Score?: number;
        mae?: number;
        rmse?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AIModelRegistrySchema = new Schema<IAIModelRegistry>({
    name: { type: String, required: true },
    version: { type: String, required: true },
    service: { type: String, required: true },
    predictionType: { type: String, required: true },
    method: { type: String, required: true },
    status: { type: String, enum: ['DEVELOPMENT', 'TESTING', 'ACTIVE', 'RETIRED'], default: 'DEVELOPMENT' },
    parameters: { type: Schema.Types.Mixed, default: {} },
    featureSchema: { type: Schema.Types.Mixed, default: {} },
    trainedAt: { type: Date },
    evaluationPeriod: {
        start: { type: Date },
        end: { type: Date }
    },
    metrics: {
        precision: { type: Number },
        recall: { type: Number },
        f1Score: { type: Number },
        mae: { type: Number },
        rmse: { type: Number }
    }
}, { timestamps: true });

AIModelRegistrySchema.index({ name: 1, version: 1 }, { unique: true });
AIModelRegistrySchema.index({ service: 1, status: 1 });

export const AIModelRegistry = mongoose.model<IAIModelRegistry>('AIModelRegistry', AIModelRegistrySchema);
