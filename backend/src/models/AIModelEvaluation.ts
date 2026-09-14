import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIModelEvaluation extends Document {
    modelId: Types.ObjectId;
    cityId: Types.ObjectId;
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE';
    predictionType: string;
    evaluationPeriodStart: Date;
    evaluationPeriodEnd: Date;
    sampleCount: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    mae?: number;
    rmse?: number;
    rocAuc?: number;
    falsePositiveRate?: number;
    falseNegativeRate?: number;
    calibrationScore?: number;
    createdAt: Date;
}

const AIModelEvaluationSchema = new Schema<IAIModelEvaluation>({
    modelId: { type: Schema.Types.ObjectId, ref: 'AIModelRegistry', required: true },
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    service: { type: String, required: true },
    predictionType: { type: String, required: true },
    evaluationPeriodStart: { type: Date, required: true },
    evaluationPeriodEnd: { type: Date, required: true },
    sampleCount: { type: Number, default: 0 },
    precision: { type: Number },
    recall: { type: Number },
    f1Score: { type: Number },
    mae: { type: Number },
    rmse: { type: Number },
    rocAuc: { type: Number },
    falsePositiveRate: { type: Number },
    falseNegativeRate: { type: Number },
    calibrationScore: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

AIModelEvaluationSchema.index({ modelId: 1, cityId: 1 });
export const AIModelEvaluation = mongoose.model<IAIModelEvaluation>('AIModelEvaluation', AIModelEvaluationSchema);
