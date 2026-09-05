import mongoose, { Schema, Document } from 'mongoose';
import { RouteStatus } from '../constants/garbage';

export interface IGarbageRoute extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    vehicleId?: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId;
    status: RouteStatus;
    schedule: {
        daysOfWeek: string[]; // e.g., ['Monday', 'Tuesday']
        startTime: string; // 'HH:mm' e.g. '07:00'
        endTime: string;
    };
    routeGeometry?: {
        type: 'LineString';
        coordinates: [number, number][]; // Array of [longitude, latitude]
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const garbageRouteSchema = new Schema<IGarbageRoute>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        description: { type: String },
        vehicleId: { type: Schema.Types.ObjectId, ref: 'GarbageVehicle' },
        driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
        status: {
            type: String,
            enum: Object.values(RouteStatus),
            default: RouteStatus.DRAFT,
        },
        schedule: {
            daysOfWeek: { type: [String], default: [] },
            startTime: { type: String },
            endTime: { type: String },
        },
        routeGeometry: {
            type: {
                type: String,
                enum: ['LineString'],
            },
            coordinates: {
                type: [[Number]],
                default: undefined,
            },
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

// Indexes
garbageRouteSchema.index({ cityId: 1 });
garbageRouteSchema.index({ cityId: 1, name: 1 }, { unique: true });
garbageRouteSchema.index({ vehicleId: 1 });
garbageRouteSchema.index({ driverId: 1 });
garbageRouteSchema.index({ status: 1 });
if (garbageRouteSchema.path('routeGeometry')) {
    garbageRouteSchema.index({ routeGeometry: '2dsphere' });
}

export const GarbageRoute = mongoose.model<IGarbageRoute>(
    'GarbageRoute',
    garbageRouteSchema
);
