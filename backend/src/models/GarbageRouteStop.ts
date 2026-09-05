import mongoose, { Schema, Document } from 'mongoose';

export interface IGarbageRouteStop extends Document {
    routeId: mongoose.Types.ObjectId;
    cityId: mongoose.Types.ObjectId;
    name: string;
    address?: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    sequence: number; // Order in the route
    scheduledArrival?: string; // e.g. '07:15 AM'
    scheduledDeparture?: string;
    notes?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const garbageRouteStopSchema = new Schema<IGarbageRouteStop>(
    {
        routeId: { type: Schema.Types.ObjectId, ref: 'GarbageRoute', required: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        address: { type: String },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
        sequence: { type: Number, required: true },
        scheduledArrival: { type: String },
        scheduledDeparture: { type: String },
        notes: { type: String },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Indexes
garbageRouteStopSchema.index({ routeId: 1 });
garbageRouteStopSchema.index({ cityId: 1 });
garbageRouteStopSchema.index({ routeId: 1, sequence: 1 }, { unique: true });
garbageRouteStopSchema.index({ location: '2dsphere' });

export const GarbageRouteStop = mongoose.model<IGarbageRouteStop>(
    'GarbageRouteStop',
    garbageRouteStopSchema
);
