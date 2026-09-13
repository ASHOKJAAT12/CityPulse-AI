import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyResource extends Document {
    cityId: Types.ObjectId;
    name: string;
    resourceCode: string;
    resourceType: 'RESPONSE_VEHICLE' | 'GENERATOR' | 'WATER_TANKER' | 'BARRIER' | 'PUMP' | 'MEDICAL_KIT' | 'LIGHTING_UNIT' | 'EV_SUPPORT' | 'OTHER';
    quantity: number;
    availableQuantity: number;
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    status: 'AVAILABLE' | 'RESERVED' | 'DEPLOYED' | 'MAINTENANCE' | 'UNAVAILABLE';
    assignedEmergencyId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const emergencyResourceSchema = new Schema<IEmergencyResource>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        resourceCode: { type: String, required: true },
        resourceType: { type: String, enum: ['RESPONSE_VEHICLE', 'GENERATOR', 'WATER_TANKER', 'BARRIER', 'PUMP', 'MEDICAL_KIT', 'LIGHTING_UNIT', 'EV_SUPPORT', 'OTHER'], required: true },
        quantity: { type: Number, required: true, min: 0 },
        availableQuantity: { type: Number, required: true, min: 0 },
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'DEPLOYED', 'MAINTENANCE', 'UNAVAILABLE'], default: 'AVAILABLE' },
        assignedEmergencyId: { type: Schema.Types.ObjectId, ref: 'EmergencyIncident' },
    },
    { timestamps: true }
);

emergencyResourceSchema.index({ cityId: 1, status: 1 });
emergencyResourceSchema.index({ cityId: 1, resourceType: 1 });

export const EmergencyResource = model<IEmergencyResource>('EmergencyResource', emergencyResourceSchema);
