import { env } from '../../config/env';

/**
 * ETA result for a vehicle journey to the next stop.
 */
export interface EtaResult {
    etaMinutes: number | null;
    etaTimestamp: Date | null;
    /** True only when we have sufficient data to compute a reliable ETA */
    available: boolean;
    /** Short human-readable label, e.g. "About 6 min" or "ETA unavailable" */
    label: string;
}

/**
 * Haversine formula — returns distance in kilometres between two lat/lng points.
 * Coordinate order: (lat, lng)
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * EtaService — Deterministic (non-AI) ETA calculation.
 *
 * Speed priority:
 *   1. currentSpeed (from live GPS, if > 1 km/h)
 *   2. recentAvgSpeed (passed by caller from recent history, if > 1 km/h)
 *   3. ETA_DEFAULT_SPEED_KMPH from env (default: 20 km/h)
 *
 * Phase 6+: Replace with AI-powered prediction.
 */
export class EtaService {
    /**
     * @param currentLoc   [longitude, latitude] GeoJSON format
     * @param targetLoc    [longitude, latitude] GeoJSON format
     * @param currentSpeed km/h from GPS payload (may be 0 or undefined)
     * @param recentAvgSpeed optional average from recent history
     */
    static calculate(
        currentLoc: [number, number],
        targetLoc: [number, number],
        currentSpeed?: number,
        recentAvgSpeed?: number
    ): EtaResult {
        const [lng1, lat1] = currentLoc;
        const [lng2, lat2] = targetLoc;

        const distanceKm = haversineKm(lat1, lng1, lat2, lng2);

        // Already at or past the stop
        if (distanceKm < 0.005) {
            return { etaMinutes: 0, etaTimestamp: new Date(), available: true, label: 'Arriving now' };
        }

        // Choose effective speed
        const MIN_RELIABLE_SPEED = 1; // km/h
        let speedKmh: number = env.ETA_DEFAULT_SPEED_KMPH;
        let usedFallback = true;

        if (currentSpeed !== undefined && currentSpeed > MIN_RELIABLE_SPEED) {
            speedKmh = currentSpeed;
            usedFallback = false;
        } else if (recentAvgSpeed !== undefined && recentAvgSpeed > MIN_RELIABLE_SPEED) {
            speedKmh = recentAvgSpeed;
            usedFallback = false;
        }

        const etaHours = distanceKm / speedKmh;
        const etaMinutes = Math.ceil(etaHours * 60); // round up for conservative estimate

        const etaTimestamp = new Date(Date.now() + etaMinutes * 60_000);

        let label: string;
        if (etaMinutes <= 1) {
            label = 'About 1 min';
        } else if (etaMinutes < 60) {
            label = `About ${etaMinutes} min`;
        } else {
            const hrs = Math.floor(etaMinutes / 60);
            label = `About ${hrs}h ${etaMinutes % 60}min`;
        }

        if (usedFallback) {
            label += ' (est.)';
        }

        return { etaMinutes, etaTimestamp, available: true, label };
    }

    /** When we cannot compute a reliable ETA */
    static unavailable(reason = 'Insufficient data'): EtaResult {
        return { etaMinutes: null, etaTimestamp: null, available: false, label: `ETA unavailable (${reason})` };
    }

    /** Haversine exposed for tests */
    static distanceKm(loc1: [number, number], loc2: [number, number]): number {
        return haversineKm(loc1[1], loc1[0], loc2[1], loc2[0]);
    }
}
