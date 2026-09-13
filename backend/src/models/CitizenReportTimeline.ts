import { Schema, model, Document, Types } from 'mongoose';

export interface ICitizenReportTimeline extends Document {
    reportId: Types.ObjectId;
    cityId: Types.ObjectId;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
    message: string;
    visibleToCitizen: boolean;
    actorType: 'CITIZEN' | 'CITY_ADMIN' | 'SUPER_ADMIN' | 'SYSTEM';
    actorId?: Types.ObjectId;
    createdAt: Date;
}

const citizenReportTimelineSchema = new Schema<ICitizenReportTimeline>(
    {
        reportId: { type: Schema.Types.ObjectId, ref: 'CitizenReport', required: true, index: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        status: {
            type: String,
            enum: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'],
            required: true
        },
        message: { type: String, required: true },
        visibleToCitizen: { type: Boolean, default: true },
        actorType: { type: String, enum: ['CITIZEN', 'CITY_ADMIN', 'SUPER_ADMIN', 'SYSTEM'], required: true },
        actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

citizenReportTimelineSchema.index({ reportId: 1, createdAt: -1 });

export const CitizenReportTimeline = model<ICitizenReportTimeline>('CitizenReportTimeline', citizenReportTimelineSchema);
