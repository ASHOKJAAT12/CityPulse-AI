import { Schema, model, Document, Types } from 'mongoose';

export interface ICitizenReportComment extends Document {
    reportId: Types.ObjectId;
    cityId: Types.ObjectId;
    authorId: Types.ObjectId;
    authorRole: 'CITIZEN' | 'CITY_ADMIN' | 'SUPER_ADMIN' | 'SYSTEM';
    message: string;
    visibleToCitizen: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const citizenReportCommentSchema = new Schema<ICitizenReportComment>(
    {
        reportId: { type: Schema.Types.ObjectId, ref: 'CitizenReport', required: true, index: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        authorRole: { type: String, enum: ['CITIZEN', 'CITY_ADMIN', 'SUPER_ADMIN', 'SYSTEM'], required: true },
        message: { type: String, required: true, maxlength: 2500 },
        visibleToCitizen: { type: Boolean, default: true }
    },
    { timestamps: true }
);

citizenReportCommentSchema.index({ reportId: 1, createdAt: -1 });

export const CitizenReportComment = model<ICitizenReportComment>('CitizenReportComment', citizenReportCommentSchema);
