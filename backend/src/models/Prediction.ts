import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction extends Document {
    cityId: mongoose.Types.ObjectId;
    service: string;
    metric: string;
    sourceType: string;
    sourceId?: mongoose.Types.ObjectId;
    predictionType: 'DEMAND' | 'FAILURE_RISK' | 'CONGESTION' | 'OUTAGE' | 'RESOURCE_USAGE' | 'SERVICE_DEGRADATION';
    predictedValue: number;
    predictedRange?: {
        min: number;
        max: number;
    };
    predictionTime: Date;
    generatedAt: Date;
    confidence: number;
    modelVersion: string;
    features: Map<string, any>;
    status: 'ACTIVE' | 'SUPERSEDED' | 'EVALUATED';
    createdAt: Date;
    updatedAt: Date;
}

const predictionSchema = new Schema<IPrediction>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        service: { type: String, required: true },
        metric: { type: String, required: true },
        sourceType: { type: String, required: true },
        sourceId: { type: Schema.Types.ObjectId, index: true },
        predictionType: {
            type: String,
            required: true,
            enum: ['DEMAND', 'FAILURE_RISK', 'CONGESTION', 'OUTAGE', 'RESOURCE_USAGE', 'SERVICE_DEGRADATION']
        },
        predictedValue: { type: Number, required: true },
        predictedRange: {
            min: { type: Number },
            max: { type: Number }
        },
        predictionTime: { type: Date, required: true },
        generatedAt: { type: Date, required: true, default: Date.now },
        confidence: { type: Number, required: true, min: 0, max: 100 },
        modelVersion: { type: String, required: true },
        features: { type: Map, of: Schema.Types.Mixed, default: {} },
        status: {
            type: String,
            required: true,
            enum: ['ACTIVE', 'SUPERSEDED', 'EVALUATED'],
            default: 'ACTIVE'
        }
    },
    { timestamps: true }
);

predictionSchema.index({ cityId: 1, service: 1, predictionTime: 1 });

export const Prediction = mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', predictionSchema);
