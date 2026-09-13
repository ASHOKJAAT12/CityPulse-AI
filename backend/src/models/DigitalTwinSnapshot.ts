import { Schema, model, Document, Types } from 'mongoose';

export interface IDigitalTwinSnapshot extends Document {
    cityId: Types.ObjectId;
    generatedAt: Date;
    schemaVersion: string;
    nodeCount: number;
    relationshipCount: number;
    summary: Record<string, any>;
    status: 'GENERATED' | 'FAILED' | 'ARCHIVED';
    dataWindow: {
        startTime: Date;
        endTime: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const DigitalTwinSnapshotSchema = new Schema<IDigitalTwinSnapshot>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        generatedAt: { type: Date, required: true },
        schemaVersion: { type: String, required: true, default: '1.0' },
        nodeCount: { type: Number, required: true },
        relationshipCount: { type: Number, required: true },
        summary: { type: Schema.Types.Mixed, required: true },
        status: {
            type: String,
            enum: ['GENERATED', 'FAILED', 'ARCHIVED'],
            default: 'GENERATED',
            index: true
        },
        dataWindow: {
            startTime: { type: Date },
            endTime: { type: Date }
        }
    },
    {
        timestamps: true,
    }
);

DigitalTwinSnapshotSchema.index({ cityId: 1, generatedAt: -1 });

export const DigitalTwinSnapshot = model<IDigitalTwinSnapshot>('DigitalTwinSnapshot', DigitalTwinSnapshotSchema);
