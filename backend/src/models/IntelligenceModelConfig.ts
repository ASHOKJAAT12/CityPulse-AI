import mongoose, { Document, Schema } from 'mongoose';

export interface IIntelligenceModelConfig extends Document {
    cityId: mongoose.Types.ObjectId;
    modelName: string;
    modelVersion: string;
    service: string;
    method: string;
    enabled: boolean;
    parameters: Map<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const intelligenceModelConfigSchema = new Schema<IIntelligenceModelConfig>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        modelName: { type: String, required: true },
        modelVersion: { type: String, required: true },
        service: { type: String, required: true },
        method: { type: String, required: true },
        enabled: { type: Boolean, required: true, default: true },
        parameters: { type: Map, of: Schema.Types.Mixed, default: {} }
    },
    { timestamps: true }
);

intelligenceModelConfigSchema.index({ cityId: 1, service: 1, modelName: 1 }, { unique: true });

export const IntelligenceModelConfig = mongoose.models.IntelligenceModelConfig || mongoose.model<IIntelligenceModelConfig>('IntelligenceModelConfig', intelligenceModelConfigSchema);
