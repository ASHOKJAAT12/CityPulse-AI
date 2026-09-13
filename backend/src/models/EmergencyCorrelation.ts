import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyCorrelation extends Document {
    emergencyId: Types.ObjectId;
    cityId: Types.ObjectId;
    sourceType: string;
    sourceId: Types.ObjectId | string;
    relation: 'CAUSED_BY' | 'RELATED_TO' | 'SUPPORTS' | 'DUPLICATE_OF' | 'AFFECTS';
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
}

const emergencyCorrelationSchema = new Schema<IEmergencyCorrelation>(
    {
        emergencyId: { type: Schema.Types.ObjectId, ref: 'EmergencyIncident', required: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        sourceType: { type: String, required: true },
        sourceId: { type: Schema.Types.Mixed, required: true },
        relation: { type: String, enum: ['CAUSED_BY', 'RELATED_TO', 'SUPPORTS', 'DUPLICATE_OF', 'AFFECTS'], required: true },
        confidence: { type: Number, min: 0, max: 1, required: true }
    },
    { timestamps: true }
);

emergencyCorrelationSchema.index({ emergencyId: 1 });
emergencyCorrelationSchema.index({ cityId: 1, sourceType: 1, sourceId: 1 });

export const EmergencyCorrelation = model<IEmergencyCorrelation>('EmergencyCorrelation', emergencyCorrelationSchema);
