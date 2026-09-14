import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTHeartbeat extends Document {
    cityId: mongoose.Types.ObjectId;
    deviceId: mongoose.Types.ObjectId;
    gatewayId?: mongoose.Types.ObjectId;
    receivedAt: Date;
    deviceTimestamp?: Date;
    status: 'ONLINE' | 'MAINTENANCE' | 'UNKNOWN';
    firmwareVersion?: string;
    signalStrength?: number;
    batteryLevel?: number;
    metadata: Record<string, any>;
}

const ioTHeartbeatSchema = new Schema({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    deviceId: { type: Schema.Types.ObjectId, ref: 'IoTDevice', required: true },
    gatewayId: { type: Schema.Types.ObjectId, ref: 'IoTGateway' },
    receivedAt: { type: Date, default: Date.now, required: true },
    deviceTimestamp: { type: Date },
    status: { type: String, enum: ['ONLINE', 'MAINTENANCE', 'UNKNOWN'], default: 'ONLINE' },
    firmwareVersion: { type: String },
    signalStrength: { type: Number },
    batteryLevel: { type: Number },
    metadata: { type: Schema.Types.Mixed, default: {} }
});

ioTHeartbeatSchema.index({ deviceId: 1, receivedAt: -1 }); // Fast query for latest heartbeat
ioTHeartbeatSchema.index({ gatewayId: 1, receivedAt: -1 });

// Capped collections or TTL indexes can limit infinite growth.
// We'll use a TTL index to bound storage (e.g., retain for 30 days)
ioTHeartbeatSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 2592000 });

export const IoTHeartbeat = mongoose.model<IIoTHeartbeat>('IoTHeartbeat', ioTHeartbeatSchema);
