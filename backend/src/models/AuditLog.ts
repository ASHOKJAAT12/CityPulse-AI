import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    resourceType: string;
    resourceId?: string;
    description?: string;
    performedById?: mongoose.Types.ObjectId;
    performerEmail?: string;
    cityId?: mongoose.Types.ObjectId;
    previousState?: Record<string, unknown>;
    newState?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        action: { type: String, required: true },
        resourceType: { type: String, required: true },
        resourceId: { type: String, index: true },
        description: { type: String },
        performedById: { type: Schema.Types.ObjectId, ref: 'User', index: true },
        performerEmail: { type: String },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', index: true },
        previousState: { type: Schema.Types.Mixed },
        newState: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
        userAgent: { type: String },
        requestId: { type: String },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
