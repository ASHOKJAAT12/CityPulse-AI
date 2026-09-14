import {
    GarbageVehicle, EVChargingStation, EVConnector, ElectricityAsset, WaterAsset
} from '../../models';
import logger from '../../utils/logger';

export class CapacityEngine {

    /**
     * Determine physical load vs total infrastructure threshold globally across domains.
     * Prevents automated planning engines from driving systems into constraints.
     */
    static async getCityCapacityBaselines(cityId: string) {
        try {
            const [evCapacity, garbageFleetCapacity, gridCapacity, waterCapacity] = await Promise.all([
                this.calculateEVCapacity(cityId),
                this.calculateGarbageFleetCapacity(cityId),
                this.calculateGridCapacity(cityId),
                this.calculateWaterCapacity(cityId),
            ]);

            return {
                cityId,
                timestamp: new Date(),
                domains: {
                    ev: evCapacity,
                    garbage: garbageFleetCapacity,
                    electricity: gridCapacity,
                    water: waterCapacity
                }
            };
        } catch (error) {
            logger.error(`Capacity Engine failure on city ${cityId}`, error);
            throw error;
        }
    }

    private static async calculateEVCapacity(cityId: string) {
        const stations = await EVChargingStation.find({ cityId, status: 'ONLINE' });
        const stationIds = stations.map(s => s._id);

        if (stationIds.length === 0) return { totalConnectors: 0, occupiedConnectors: 0, utilizationScore: 0, bottlenecks: [], hasShortage: false };

        // BUG FIX #1: Query must include 'CHARGING' status since that is what represents
        // an occupied connector in the EVConnector schema — not 'OCCUPIED'.
        const connectors = await EVConnector.find({
            stationId: { $in: stationIds },
            status: { $in: ['AVAILABLE', 'CHARGING', 'RESERVED', 'FAULT'] }
        });

        const total = connectors.length;
        if (total === 0) return { totalConnectors: 0, occupiedConnectors: 0, utilizationScore: 0, bottlenecks: [], hasShortage: false };

        // BUG FIX #2: Filter correctly using 'CHARGING' (active usage) and 'RESERVED' (committed usage)
        const occupied = connectors.filter(c => c.status === 'CHARGING' || c.status === 'RESERVED').length;
        const score = (occupied / total) * 100;

        const bottlenecks: { stationId: any; name: string; utilization: number }[] = [];
        for (const st of stations) {
            const stCons = connectors.filter(c => String(c.stationId) === String(st._id));
            if (stCons.length > 0) {
                const occ = stCons.filter(c => c.status === 'CHARGING' || c.status === 'RESERVED').length;
                if ((occ / stCons.length) > 0.85) {
                    bottlenecks.push({ stationId: st._id, name: st.name, utilization: Math.round((occ / stCons.length) * 100) });
                }
            }
        }

        return {
            totalConnectors: total,
            occupiedConnectors: occupied,
            utilizationScore: Math.round(score),
            bottlenecks,
            hasShortage: score >= 90
        };
    }

    private static async calculateGarbageFleetCapacity(cityId: string) {
        const vehicles = await GarbageVehicle.find({ cityId });
        const total = vehicles.length;

        if (total === 0) return { totalVehicles: 0, activeVehicles: 0, maintenanceVehicles: 0, safeWorkingCapacity: 0, utilizationScore: 0, hasShortage: false };

        // Status values come from the GarbageVehicle schema constants
        const active = vehicles.filter(v => (v.status as string) === 'ON_ROUTE' || (v.status as string) === 'COLLECTING').length;
        const maintenance = vehicles.filter(v => (v.status as string) === 'MAINTENANCE' || (v.status as string) === 'BREAKDOWN').length;

        const safeCapacity = total - maintenance;
        // BUG FIX #3: Guard against division by zero when all vehicles are in maintenance
        const score = safeCapacity > 0 ? Math.min((active / safeCapacity) * 100, 100) : 100;

        return {
            totalVehicles: total,
            activeVehicles: active,
            maintenanceVehicles: maintenance,
            safeWorkingCapacity: safeCapacity,
            utilizationScore: Math.round(score),
            hasShortage: score >= 95
        };
    }

    private static async calculateGridCapacity(cityId: string) {
        const transformers = await ElectricityAsset.find({
            cityId,
            assetType: 'TRANSFORMER',
            operationalStatus: { $in: ['ACTIVE', 'DEGRADED'] }
        });

        if (transformers.length === 0) return { totalCapacityKVA: 0, currentLoadKVA: 0, utilizationScore: 0, bottlenecks: [], hasShortage: false };

        let maxLoad = 0;
        let currentLoadAgg = 0;
        const bottlenecks: { assetId: any; name: string; utilization: number }[] = [];

        for (const t of transformers) {
            const cap = (t as any).capacityKVA || (t as any).capacity || 1000;
            const cur = (t as any).currentLoadKVA || (t as any).currentLoad || 0;

            maxLoad += cap;
            currentLoadAgg += cur;

            // BUG FIX #4: Guard against cap === 0 division
            if (cap > 0 && (cur / cap) > 0.85) {
                bottlenecks.push({ assetId: t._id, name: t.name, utilization: Math.round((cur / cap) * 100) });
            }
        }

        const score = maxLoad > 0 ? (currentLoadAgg / maxLoad) * 100 : 0;

        return {
            totalCapacityKVA: maxLoad,
            currentLoadKVA: currentLoadAgg,
            utilizationScore: Math.round(score),
            bottlenecks,
            hasShortage: score >= 90
        };
    }

    private static async calculateWaterCapacity(cityId: string) {
        const tanks = await WaterAsset.find({
            cityId,
            assetType: 'STORAGE_TANK',
            operationalStatus: { $in: ['OPERATIONAL', 'DEGRADED'] }
        });

        if (tanks.length === 0) return { totalStorageGallons: 0, currentReservedGallons: 0, fillScore: 0, bottlenecks: [], hasShortage: false };

        let maxCap = 0;
        let curLevel = 0;
        const bottlenecks: { assetId: any; name: string; fillLevel: number }[] = [];

        for (const t of tanks) {
            const cap = (t as any).capacityLiters || (t as any).capacity || 10000;
            const cur = (t as any).currentLevelLiters || (t as any).currentLevel || 0;

            maxCap += cap;
            curLevel += cur;

            // BUG FIX #5: Guard against cap === 0 division
            if (cap > 0 && (cur / cap) < 0.20) {
                bottlenecks.push({ assetId: t._id, name: t.name, fillLevel: Math.round((cur / cap) * 100) });
            }
        }

        const score = maxCap > 0 ? (curLevel / maxCap) * 100 : 0;

        return {
            totalStorageGallons: maxCap,
            currentReservedGallons: curLevel,
            fillScore: Math.round(score),
            bottlenecks,
            hasShortage: score <= 25
        };
    }
}
