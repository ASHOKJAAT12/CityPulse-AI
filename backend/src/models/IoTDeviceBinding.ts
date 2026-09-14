import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTDeviceBinding extends Document {
    cityId: mongoose.Types.ObjectId;
    deviceId: mongoose.Types.ObjectId;
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE';
    entityType: string; // e.g., 'WaterSensor', 'ElectricitySensor', 'TrafficSensor'
    entityId: mongoose.Types.ObjectId;
    bindingType: 'SENSOR' | 'METER' | 'TRACKER' | 'CONTROLLER' | 'GATEWAY';
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ioTDeviceBindingSchema = new Schema({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    deviceId: { type: Schema.Types.ObjectId, ref: 'IoTDevice', required: true },
    service: {
        type: String,
        enum: ['WATER', 'ELECTRICITY', 'TRAFFIC', 'EV', 'STREETLIGHT', 'GARBAGE'],
        required: true
    },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true }, // Dynamic ref
    bindingType: {
        type: String,
        enum: ['SENSOR', 'METER', 'TRACKER', 'CONTROLLER', 'GATEWAY'],
        required: true
    },
    active: { type: Boolean, default: true }
}, { timestamps: true });

ioTDeviceBindingSchema.index({ deviceId: 1, active: 1 });
ioTDeviceBindingSchema.index({ entityId: 1, service: 1 });
// Enforce unique 1:1 binding between an IoT Device and a single active service entity
ioTDeviceBindingSchema.index({ deviceId: 1 }, { unique: true, partialFilterExpression: { active: true } });
ioTDeviceBindingSchema.index({ entityId: 1 }, { unique: true, partialFilterExpression: { active: true } });

export const IoTDeviceBinding = mongoose.model<IIoTDeviceBinding>('IoTDeviceBinding', ioTDeviceBindingSchema);
