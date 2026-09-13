import { Schema, model, Document, Types } from 'mongoose';

export interface IDigitalTwinRelationship extends Document {
    cityId: Types.ObjectId;
    sourceNodeId: Types.ObjectId;
    targetNodeId: Types.ObjectId;
    relationshipType: 'CONNECTED_TO' | 'DEPENDS_ON' | 'LOCATED_IN' | 'SUPPLIES' | 'SERVES' | 'MONITORS' | 'AFFECTS' | 'NEAR' | 'ROUTES_THROUGH' | 'CONTROLLED_BY' | 'RELATED_TO';
    weight: number;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const DigitalTwinRelationshipSchema = new Schema<IDigitalTwinRelationship>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        sourceNodeId: { type: Schema.Types.ObjectId, ref: 'DigitalTwinNode', required: true, index: true },
        targetNodeId: { type: Schema.Types.ObjectId, ref: 'DigitalTwinNode', required: true, index: true },
        relationshipType: {
            type: String,
            required: true,
            enum: ['CONNECTED_TO', 'DEPENDS_ON', 'LOCATED_IN', 'SUPPLIES', 'SERVES', 'MONITORS', 'AFFECTS', 'NEAR', 'ROUTES_THROUGH', 'CONTROLLED_BY', 'RELATED_TO'],
        },
        weight: { type: Number, default: 1 },
        active: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true,
    }
);

// Unique Graph Edge per specific connection to prevent unbounded topological looping
DigitalTwinRelationshipSchema.index({ sourceNodeId: 1, targetNodeId: 1, relationshipType: 1 }, { unique: true });

export const DigitalTwinRelationship = model<IDigitalTwinRelationship>('DigitalTwinRelationship', DigitalTwinRelationshipSchema);
