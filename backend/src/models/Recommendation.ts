import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation extends Document {
    cityId: mongoose.Types.ObjectId;
    intelligenceEventId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    action: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
    status: 'NEW' | 'REVIEWED' | 'ACCEPTED' | 'DISMISSED' | 'COMPLETED';
    createdAt: Date;
    updatedAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        intelligenceEventId: { type: Schema.Types.ObjectId, ref: 'IntelligenceEvent', required: true, index: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        action: { type: String, required: true },
        priority: {
            type: String,
            required: true,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        },
        reason: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: ['NEW', 'REVIEWED', 'ACCEPTED', 'DISMISSED', 'COMPLETED'],
            default: 'NEW',
            index: true
        }
    },
    { timestamps: true }
);

export const Recommendation = mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', recommendationSchema);
