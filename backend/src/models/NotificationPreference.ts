import { Schema, model, Document, Types } from 'mongoose';

export interface INotificationPreference extends Document {
    userId: Types.ObjectId;
    cityId: Types.ObjectId;
    category: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE' | 'CITIZEN_REPORT' | 'SYSTEM' | 'MAINTENANCE' | 'SECURITY';
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    criticalOverride: boolean; // If true, ignore false settings for critical alerts
    createdAt: Date;
    updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        category: {
            type: String,
            enum: ['WATER', 'ELECTRICITY', 'TRAFFIC', 'EV', 'STREETLIGHT', 'GARBAGE', 'CITIZEN_REPORT', 'SYSTEM', 'MAINTENANCE', 'SECURITY'],
            required: true
        },
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
        criticalOverride: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Ensure a user can only have one preference entry per category per city
notificationPreferenceSchema.index({ userId: 1, cityId: 1, category: 1 }, { unique: true });

export const NotificationPreference = model<INotificationPreference>('NotificationPreference', notificationPreferenceSchema);
