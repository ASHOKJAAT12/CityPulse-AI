import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyTimeline extends Document {
    emergencyId: Types.ObjectId;
    cityId: Types.ObjectId;
    eventType: string; // e.g. CREATED, VERIFIED, ACKNOWLEDGED, TEAM_ASSIGNED, etc.
    message: string;
    actorType: 'USER' | 'SYSTEM' | 'AI';
    actorId?: Types.ObjectId | string;
    visibleToCitizen: boolean;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date; // Automatically added by timestamps but we mostly rely on createdAt natively
}

const emergencyTimelineSchema = new Schema<IEmergencyTimeline>(
    {
        emergencyId: { type: Schema.Types.ObjectId, ref: 'EmergencyIncident', required: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        eventType: { type: String, required: true },
        message: { type: String, required: true },
        actorType: { type: String, enum: ['USER', 'SYSTEM', 'AI'], required: true },
        actorId: { type: Schema.Types.Mixed }, // String or ObjectId
        visibleToCitizen: { type: Boolean, default: false },
        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

emergencyTimelineSchema.index({ emergencyId: 1, createdAt: 1 });
emergencyTimelineSchema.index({ cityId: 1, createdAt: -1 });

export const EmergencyTimeline = model<IEmergencyTimeline>('EmergencyTimeline', emergencyTimelineSchema);
