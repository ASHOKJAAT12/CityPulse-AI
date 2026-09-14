import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTDeviceIncident extends Document {
    cityId: mongoose.Types.ObjectId;
    deviceId: mongoose.Types.ObjectId;
    gatewayId?: mongoose.Types.ObjectId;
    type: 'OFFLINE' | 'COMMUNICATION_FAILURE' | 'INVALID_TELEMETRY' | 'CLOCK_DRIFT' | 'BATTERY_LOW' | 'SIGNAL_WEAK' | 'FIRMWARE_ISSUE' | 'OTHER';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    evidence?: string[];
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

const ioTDeviceIncidentSchema = new Schema({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    deviceId: { type: Schema.Types.ObjectId, ref: 'IoTDevice', required: true },
    gatewayId: { type: Schema.Types.ObjectId, ref: 'IoTGateway' },
    type: { type: String, enum: ['OFFLINE', 'COMMUNICATION_FAILURE', 'INVALID_TELEMETRY', 'CLOCK_DRIFT', 'BATTERY_LOW', 'SIGNAL_WEAK', 'FIRMWARE_ISSUE', 'OTHER'], required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], default: 'OPEN' },
    evidence: { type: [String], default: [] },
    resolvedAt: { type: Date }
}, { timestamps: true });

ioTDeviceIncidentSchema.index({ cityId: 1, status: 1 });
ioTDeviceIncidentSchema.index({ deviceId: 1, status: 1 });

export const IoTDeviceIncident = mongoose.model<IIoTDeviceIncident>('IoTDeviceIncident', ioTDeviceIncidentSchema);
