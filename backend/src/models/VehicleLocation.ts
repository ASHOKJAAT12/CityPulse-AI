import mongoose, { Schema, Document } from 'mongoose';

/**
 * VehicleLocation — GPS history for a vehicle.
 *
 * Retention policy:
 *   A TTL index on `recordedAt` automatically removes documents after
 *   `VEHICLE_LOCATION_RETENTION_DAYS` days (default: 7).
 *
 *   This means we keep ~7 days of trace data without ever needing manual cleanup.
 *   Increase the TTL for analytics requirements in production.
 *
 * Write throttle:
 *   LocationHistoryService writes at most once per GPS_UPDATE_INTERVAL_SECONDS
 *   per vehicle to avoid excessive DB writes.
 */
export interface IVehicleLocation extends Document {
    vehicleId: mongoose.Types.ObjectId;
    cityId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
    routeId?: mongoose.Types.ObjectId;
    driverId?: mongoose.Types.ObjectId;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    speed?: number;       // km/h
    heading?: number;     // degrees 0-360
    accuracy?: number;    // meters
    recordedAt: Date;
    createdAt: Date;
}

const vehicleLocationSchema = new Schema<IVehicleLocation>(
    {
        vehicleId: { type: Schema.Types.ObjectId, ref: 'GarbageVehicle', required: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        sessionId: { type: Schema.Types.ObjectId, ref: 'TrackingSession', required: true },
        routeId: { type: Schema.Types.ObjectId, ref: 'GarbageRoute' },
        driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true },
        },
        speed: { type: Number, min: 0 },
        heading: { type: Number, min: 0, max: 360 },
        accuracy: { type: Number, min: 0 },
        recordedAt: { type: Date, required: true, default: Date.now },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// 2dsphere index for geospatial queries
vehicleLocationSchema.index({ location: '2dsphere' });

// Compound query indexes
vehicleLocationSchema.index({ vehicleId: 1, recordedAt: -1 });
vehicleLocationSchema.index({ cityId: 1, recordedAt: -1 });
vehicleLocationSchema.index({ sessionId: 1, recordedAt: -1 });
vehicleLocationSchema.index({ routeId: 1, recordedAt: -1 });

// TTL index — documents auto-deleted after VEHICLE_LOCATION_RETENTION_DAYS days
// The actual expiry seconds is set at model registration time via env config.
// See server.ts for dynamic TTL configuration.
vehicleLocationSchema.index(
    { recordedAt: 1 },
    { expireAfterSeconds: (parseInt(process.env['VEHICLE_LOCATION_RETENTION_DAYS'] ?? '7', 10)) * 86400 }
);

export const VehicleLocation = mongoose.model<IVehicleLocation>(
    'VehicleLocation',
    vehicleLocationSchema
);
