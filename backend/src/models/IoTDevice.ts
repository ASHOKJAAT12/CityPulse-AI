import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTDevice extends Document {
    cityId: mongoose.Types.ObjectId;
    deviceId: string;
    deviceName: string;
    deviceType: 'SENSOR' | 'CONTROLLER' | 'GATEWAY' | 'METER' | 'TRACKER' | 'ACTUATOR' | 'CAMERA_METADATA_ONLY' | 'OTHER';
    manufacturer?: string;
    hardwareModel?: string;
    firmwareVersion?: string;
    gatewayId?: mongoose.Types.ObjectId;
    status: 'REGISTERED' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
    connectionStatus: 'ONLINE' | 'OFFLINE' | 'STALE' | 'UNKNOWN';
    lastSeenAt?: Date;
    registeredAt: Date;
    activatedAt?: Date;
    deactivatedAt?: Date;
    active: boolean;
    metadata: Record<string, any>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ioTDeviceSchema = new Schema({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true },
    deviceType: {
        type: String,
        enum: ['SENSOR', 'CONTROLLER', 'GATEWAY', 'METER', 'TRACKER', 'ACTUATOR', 'CAMERA_METADATA_ONLY', 'OTHER'],
        required: true
    },
    manufacturer: { type: String },
    hardwareModel: { type: String },
    firmwareVersion: { type: String },
    gatewayId: { type: Schema.Types.ObjectId, ref: 'IoTGateway' }, // Self referential to Gateway or distinct
    status: {
        type: String,
        enum: ['REGISTERED', 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DECOMMISSIONED'],
        default: 'REGISTERED'
    },
    connectionStatus: {
        type: String,
        enum: ['ONLINE', 'OFFLINE', 'STALE', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    lastSeenAt: { type: Date },
    registeredAt: { type: Date, default: Date.now },
    activatedAt: { type: Date },
    deactivatedAt: { type: Date },
    active: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Ensure unique deviceId within the platform, or scoped to city if preferred. Platform-level is safer for device tokens.
ioTDeviceSchema.index({ deviceId: 1 }, { unique: true });
ioTDeviceSchema.index({ cityId: 1, connectionStatus: 1 });
ioTDeviceSchema.index({ gatewayId: 1 });

export const IoTDevice = mongoose.model<IIoTDevice>('IoTDevice', ioTDeviceSchema);
