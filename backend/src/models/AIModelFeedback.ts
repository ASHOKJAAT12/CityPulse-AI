import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIModelFeedback extends Document {
    cityId: Types.ObjectId;
    predictionId: Types.ObjectId;
    userId: Types.ObjectId;
    action: 'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE' | 'ACTION_TAKEN';
    reason?: string;
    actualOutcome?: string;
    outcomeAt?: Date;
    createdAt: Date;
}

const AIModelFeedbackSchema = new Schema<IAIModelFeedback>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    predictionId: { type: Schema.Types.ObjectId, ref: 'PredictiveMaintenanceRisk', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['CONFIRMED', 'DISMISSED', 'FALSE_POSITIVE', 'FALSE_NEGATIVE', 'ACTION_TAKEN'], required: true },
    reason: { type: String },
    actualOutcome: { type: String },
    outcomeAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

AIModelFeedbackSchema.index({ predictionId: 1 });
AIModelFeedbackSchema.index({ cityId: 1, action: 1 });
export const AIModelFeedback = mongoose.model<IAIModelFeedback>('AIModelFeedback', AIModelFeedbackSchema);
