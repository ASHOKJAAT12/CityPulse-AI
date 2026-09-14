import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTGateway extends Document {
    cityId: mongoose.Types.ObjectId;
    gatewayId: string;
    name: string;
    gatewayType: 'EDGE' | 'INDUSTRIAL' | 'MOBILE' | 'SOFTWARE' | 'OTHER';
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    status: 'REGISTERED' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
    connectionStatus: 'ONLINE' | 'OFFLINE' | 'STALE' | 'UNKNOWN';
    lastSeenAt?: Date;
    firmwareVersion?: string;
    deviceCount: number;
    metadata: Record<string, any>;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ioTGatewaySchema = new Schema({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    gatewayId: { type: String, required: true },
    name: { type: String, required: true },
    gatewayType: { type: String, enum: ['EDGE', 'INDUSTRIAL', 'MOBILE', 'SOFTWARE', 'OTHER'], required: true },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] }
    },
    status: { type: String, enum: ['REGISTERED', 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DECOMMISSIONED'], default: 'REGISTERED' },
    connectionStatus: { type: String, enum: ['ONLINE', 'OFFLINE', 'STALE', 'UNKNOWN'], default: 'UNKNOWN' },
    lastSeenAt: { type: Date },
    firmwareVersion: { type: String },
    deviceCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true }
}, { timestamps: true });

ioTGatewaySchema.index({ gatewayId: 1 }, { unique: true });
ioTGatewaySchema.index({ cityId: 1, connectionStatus: 1 });
ioTGatewaySchema.index({ location: '2dsphere' });

export const IoTGateway = mongoose.model<IIoTGateway>('IoTGateway', ioTGatewaySchema);
