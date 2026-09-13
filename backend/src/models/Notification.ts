import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
    userId?: Types.ObjectId;     // Optional, if null, means broadcast
    cityId: Types.ObjectId;
    type: 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS';
    category: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE' | 'CITIZEN_REPORT' | 'SYSTEM' | 'MAINTENANCE' | 'SECURITY';
    priority: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    message: string;
    status: 'UNREAD' | 'READ' | 'ARCHIVED';
    readAt?: Date;
    expiresAt?: Date;
    referenceType?: string;      // E.g., 'WaterIncident', 'ElectricityOutage'
    referenceId?: Types.ObjectId;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        type: { type: String, enum: ['IN_APP', 'PUSH', 'EMAIL', 'SMS'], required: true, default: 'IN_APP' },
        category: {
            type: String,
            enum: ['WATER', 'ELECTRICITY', 'TRAFFIC', 'EV', 'STREETLIGHT', 'GARBAGE', 'CITIZEN_REPORT', 'SYSTEM', 'MAINTENANCE', 'SECURITY'],
            required: true
        },
        priority: { type: String, enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'INFO' },
        title: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ['UNREAD', 'READ', 'ARCHIVED'], default: 'UNREAD' },
        readAt: { type: Date },
        expiresAt: { type: Date },
        referenceType: { type: String },
        referenceId: { type: Schema.Types.ObjectId },
        metadata: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

// Indexes defined by Master Instructions
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ cityId: 1, createdAt: -1 });
notificationSchema.index({ cityId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for fast expiration cleanup
notificationSchema.index({ referenceType: 1, referenceId: 1 });

export const Notification = model<INotification>('Notification', notificationSchema);
