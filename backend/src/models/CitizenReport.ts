import { Schema, model, Document, Types } from 'mongoose';

export interface IAttachment {
    url: string;
    publicId?: string;
    fileType: string;
    size: number;
    uploadedAt: Date;
}

export interface ICitizenReport extends Document {
    cityId: Types.ObjectId;
    reportNumber: string;
    citizenId: Types.ObjectId;
    category: string;
    subcategory: string;
    title: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    address?: string;
    attachments: IAttachment[];
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
    source: 'WEB' | 'MOBILE' | 'ADMIN' | 'IMPORT';
    department?: Types.ObjectId;
    assignedTo?: Types.ObjectId;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    duplicateOf?: Types.ObjectId;
    verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
    resolution?: string;
    relatedAssetType?: string;
    relatedAssetId?: Types.ObjectId;
    closedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const citizenReportSchema = new Schema<ICitizenReport>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        reportNumber: { type: String, required: true, unique: true },
        citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: String, required: true },
        subcategory: { type: String, required: true },
        title: { type: String, required: true, maxlength: 120 },
        description: { type: String, required: true, maxlength: 2000 },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        },
        address: { type: String },
        attachments: [
            {
                url: { type: String, required: true },
                publicId: { type: String },
                fileType: { type: String, required: true },
                size: { type: Number, required: true },
                uploadedAt: { type: Date, default: Date.now }
            }
        ],
        severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        status: {
            type: String,
            enum: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'],
            default: 'SUBMITTED'
        },
        source: { type: String, enum: ['WEB', 'MOBILE', 'ADMIN', 'IMPORT'], default: 'WEB' },
        department: { type: Schema.Types.ObjectId, ref: 'CityDepartment' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
        duplicateOf: { type: Schema.Types.ObjectId, ref: 'CitizenReport' },
        verificationStatus: { type: String, enum: ['UNVERIFIED', 'VERIFIED', 'REJECTED'], default: 'UNVERIFIED' },
        resolution: { type: String },
        relatedAssetType: { type: String },
        relatedAssetId: { type: Schema.Types.ObjectId },
        closedAt: { type: Date }
    },
    { timestamps: true }
);

// GeoJSON index for proximity searches
citizenReportSchema.index({ location: '2dsphere' });
// City isolation and fast lookups
citizenReportSchema.index({ cityId: 1, createdAt: -1 });
citizenReportSchema.index({ citizenId: 1, createdAt: -1 });
citizenReportSchema.index({ cityId: 1, status: 1 });
citizenReportSchema.index({ cityId: 1, category: 1 });
citizenReportSchema.index({ cityId: 1, priority: 1 });
citizenReportSchema.index({ cityId: 1, department: 1 });

export const CitizenReport = model<ICitizenReport>('CitizenReport', citizenReportSchema);
