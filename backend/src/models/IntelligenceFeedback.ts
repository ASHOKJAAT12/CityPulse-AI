import mongoose, { Document, Schema } from 'mongoose';

export interface IIntelligenceFeedback extends Document {
    cityId: mongoose.Types.ObjectId;
    intelligenceEventId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: 'CONFIRMED' | 'DISMISSED' | 'FALSE_POSITIVE' | 'ACTION_TAKEN';
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const intelligenceFeedbackSchema = new Schema<IIntelligenceFeedback>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        intelligenceEventId: { type: Schema.Types.ObjectId, ref: 'IntelligenceEvent', required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        action: {
            type: String,
            required: true,
            enum: ['CONFIRMED', 'DISMISSED', 'FALSE_POSITIVE', 'ACTION_TAKEN']
        },
        reason: { type: String }
    },
    { timestamps: true }
);

export const IntelligenceFeedback = mongoose.models.IntelligenceFeedback || mongoose.model<IIntelligenceFeedback>('IntelligenceFeedback', intelligenceFeedbackSchema);
