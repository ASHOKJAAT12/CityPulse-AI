import { Schema, model, Document, Types } from 'mongoose';

export interface IDigitalTwinNode extends Document {
    cityId: Types.ObjectId;
    domain: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE' | 'EMERGENCY' | 'CITIZEN_REPORT' | 'INTELLIGENCE';
    entityType: string;
    entityId: Types.ObjectId;
    name: string;
    location: {
        type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
        coordinates: any;
    };
    status: 'ONLINE' | 'ACTIVE' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'MAINTENANCE' | 'UNKNOWN';
    health: number; // 0-100
    zoneId?: Types.ObjectId;
    visible: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const DigitalTwinNodeSchema = new Schema<IDigitalTwinNode>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        domain: {
            type: String,
            required: true,
            enum: ['WATER', 'ELECTRICITY', 'TRAFFIC', 'EV', 'STREETLIGHT', 'GARBAGE', 'EMERGENCY', 'CITIZEN_REPORT', 'INTELLIGENCE'],
            index: true
        },
        entityType: { type: String, required: true },
        entityId: { type: Schema.Types.ObjectId, required: true, index: true },
        name: { type: String, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point', 'LineString', 'Polygon', 'MultiPolygon'],
                required: true,
            },
            coordinates: { type: Schema.Types.Mixed, required: true },
        },
        status: {
            type: String,
            enum: ['ONLINE', 'ACTIVE', 'WARNING', 'CRITICAL', 'OFFLINE', 'MAINTENANCE', 'UNKNOWN'],
            default: 'UNKNOWN',
            index: true
        },
        health: { type: Number, required: true, default: 100 },
        zoneId: { type: Schema.Types.ObjectId },
        visible: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true,
    }
);

// Indexes
DigitalTwinNodeSchema.index({ location: '2dsphere' });
DigitalTwinNodeSchema.index({ cityId: 1, domain: 1 });
DigitalTwinNodeSchema.index({ cityId: 1, entityId: 1 }, { unique: true }); // Prevent duplicate graph nodes per asset
// DigitalTwinNodeSchema.index({ status: 1 }); // Removed: duplicate of index: true in schema definition

export const DigitalTwinNode = model<IDigitalTwinNode>('DigitalTwinNode', DigitalTwinNodeSchema);
