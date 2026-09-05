import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
    token: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
    revokedAt?: Date;
    createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        token: { type: String, required: true, unique: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        expiresAt: { type: Date, required: true },
        revokedAt: { type: Date },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index to automatically remove expired refresh tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
