import { VehicleLocation, IVehicleLocation } from '../../models/VehicleLocation';
import { env } from '../../config/env';
import mongoose from 'mongoose';

export interface LocationData {
    vehicleId: string;
    cityId: string;
    sessionId: string;
    routeId?: string;
    driverId?: string;
    location: { type: 'Point'; coordinates: [number, number] };
    speed?: number;
    heading?: number;
    accuracy?: number;
    recordedAt?: Date;
}

/**
 * In-memory throttle map: vehicleId → last DB write timestamp.
 * Avoids writing to MongoDB on every GPS tick when updates arrive faster
 * than GPS_UPDATE_INTERVAL_SECONDS.
 */
const lastWriteMap = new Map<string, number>();

export class LocationHistoryService {
    /**
     * Store a GPS point to history if the throttle interval has elapsed.
     * Returns true if the record was written, false if throttled.
     */
    static async store(data: LocationData, forceWrite = false): Promise<boolean> {
        const now = Date.now();
        const lastWrite = lastWriteMap.get(data.vehicleId) ?? 0;
        const intervalMs = env.GPS_UPDATE_INTERVAL_SECONDS * 1000;

        if (!forceWrite && now - lastWrite < intervalMs) {
            return false; // throttled
        }

        await VehicleLocation.create({
            vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
            cityId: new mongoose.Types.ObjectId(data.cityId),
            sessionId: new mongoose.Types.ObjectId(data.sessionId),
            routeId: data.routeId ? new mongoose.Types.ObjectId(data.routeId) : undefined,
            driverId: data.driverId ? new mongoose.Types.ObjectId(data.driverId) : undefined,
            location: data.location,
            speed: data.speed,
            heading: data.heading,
            accuracy: data.accuracy,
            recordedAt: data.recordedAt ?? new Date(),
        });

        lastWriteMap.set(data.vehicleId, now);
        return true;
    }

    /**
     * Get paginated GPS history for a vehicle within optional time range.
     */
    static async getHistory(
        vehicleId: string,
        options: {
            start?: Date;
            end?: Date;
            page?: number;
            limit?: number;
        } = {}
    ): Promise<{ records: IVehicleLocation[]; total: number; page: number; limit: number }> {
        const page = Math.max(1, options.page ?? 1);
        const limit = Math.min(500, Math.max(1, options.limit ?? 100));
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {
            vehicleId: new mongoose.Types.ObjectId(vehicleId),
        };
        if (options.start || options.end) {
            const dateFilter: Record<string, unknown> = {};
            if (options.start) dateFilter['$gte'] = options.start;
            if (options.end) dateFilter['$lte'] = options.end;
            query['recordedAt'] = dateFilter;
        }

        const [records, total] = await Promise.all([
            VehicleLocation.find(query).sort({ recordedAt: -1 }).skip(skip).limit(limit).lean(),
            VehicleLocation.countDocuments(query),
        ]);

        return { records: records as unknown as IVehicleLocation[], total, page, limit };
    }

    /**
     * Compute average speed from most recent N history records.
     * Returns undefined if insufficient data.
     */
    static async getRecentAvgSpeed(vehicleId: string, samples = 5): Promise<number | undefined> {
        const records = await VehicleLocation.find({
            vehicleId: new mongoose.Types.ObjectId(vehicleId),
            speed: { $exists: true, $gt: 0 },
        })
            .sort({ recordedAt: -1 })
            .limit(samples)
            .select('speed')
            .lean();

        if (records.length === 0) return undefined;
        const total = records.reduce((sum, r) => sum + (r.speed ?? 0), 0);
        return total / records.length;
    }

    /** Clear throttle state (for testing). */
    static clearThrottle(vehicleId?: string): void {
        if (vehicleId) {
            lastWriteMap.delete(vehicleId);
        } else {
            lastWriteMap.clear();
        }
    }
}
