import mongoose, { Schema, Document } from 'mongoose';

export interface IStreetlightZone extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    zoneCode: string;
    description?: string;
    geometry?: {
        type: 'Polygon';
        coordinates: number[][][]; // GeoJSON Polygon
    };
    status: 'ACTIVE' | 'INACTIVE';
    active: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const StreetlightZoneSchema = new Schema<IStreetlightZone>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    name: { type: String, required: true },
    zoneCode: { type: String, required: true },
    description: { type: String },
    geometry: {
        type: { type: String, enum: ['Polygon'] },
        coordinates: { type: [[[Number]]] }
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

String(StreetlightZoneSchema.index({ cityId: 1, zoneCode: 1 }, { unique: true }));
StreetlightZoneSchema.index({ geometry: '2dsphere' });

export const StreetlightZone = mongoose.model<IStreetlightZone>('StreetlightZone', StreetlightZoneSchema);
