import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTTelemetryEvent extends Document {
    cityId: mongoose.Types.ObjectId;
    deviceId: mongoose.Types.ObjectId;
    gatewayId?: mongoose.Types.ObjectId;
    service: string;
    entityType: string;
    entityId?: mongoose.Types.ObjectId;
    messageId: string;
    timestamp: Date;
    receivedAt: Date;
    metrics: Record<string, any>;
    quality: 'GOOD' | 'WARNING' | 'POOR' | 'INVALID' | 'UNKNOWN';
    source: string;
    schemaVersion: string;
    processingStatus: 'RECEIVED' | 'VALIDATED' | 'PROCESSED' | 'REJECTED' | 'DUPLICATE' | 'FAILED';
    errorCode?: string;
    createdAt: Date;
}

const ioTTelemetryEventSchema = new Schema({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    deviceId: { type: Schema.Types.ObjectId, ref: 'IoTDevice', required: true },
    gatewayId: { type: Schema.Types.ObjectId, ref: 'IoTGateway' },
    service: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    messageId: { type: String, required: true }, // For idempotency/duplicate detection
    timestamp: { type: Date, required: true }, // from device
    receivedAt: { type: Date, default: Date.now, required: true },
    metrics: { type: Schema.Types.Mixed, required: true },
    quality: { type: String, enum: ['GOOD', 'WARNING', 'POOR', 'INVALID', 'UNKNOWN'], default: 'UNKNOWN' },
    source: { type: String, required: true },
    schemaVersion: { type: String, default: '1.0' },
    processingStatus: { type: String, enum: ['RECEIVED', 'VALIDATED', 'PROCESSED', 'REJECTED', 'DUPLICATE', 'FAILED'], default: 'RECEIVED' },
    errorCode: { type: String },
    createdAt: { type: Date, default: Date.now }
});

ioTTelemetryEventSchema.index({ cityId: 1, service: 1, createdAt: -1 });
ioTTelemetryEventSchema.index({ deviceId: 1, timestamp: -1 });
ioTTelemetryEventSchema.index({ messageId: 1 }); // Essential for deduplication lookup

// Typical retention constraint for historical telemetry tables
ioTTelemetryEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 Days

export const IoTTelemetryEvent = mongoose.model<IIoTTelemetryEvent>('IoTTelemetryEvent', ioTTelemetryEventSchema);
