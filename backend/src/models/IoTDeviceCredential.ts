import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTDeviceCredential extends Document {
    deviceId: mongoose.Types.ObjectId;
    credentialType: 'DEVICE_TOKEN' | 'API_KEY_HASH' | 'CERTIFICATE_REFERENCE';
    credentialHash: string;
    status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
    issuedAt: Date;
    expiresAt?: Date;
    lastUsedAt?: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ioTDeviceCredentialSchema = new Schema({
    deviceId: { type: Schema.Types.ObjectId, ref: 'IoTDevice', required: true },
    credentialType: { type: String, enum: ['DEVICE_TOKEN', 'API_KEY_HASH', 'CERTIFICATE_REFERENCE'], required: true },
    credentialHash: { type: String, required: true }, // Store bcrypt hashes only
    status: { type: String, enum: ['ACTIVE', 'REVOKED', 'EXPIRED'], default: 'ACTIVE' },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
}, { timestamps: true });

ioTDeviceCredentialSchema.index({ deviceId: 1, status: 1 });

export const IoTDeviceCredential = mongoose.model<IIoTDeviceCredential>('IoTDeviceCredential', ioTDeviceCredentialSchema);
