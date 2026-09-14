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
            const evCapacity = await this.calculateEVCapacity(cityId);
            const garbageFleetCapacity = await this.calculateGarbageFleetCapacity(cityId);
            const gridCapacity = await this.calculateGridCapacity(cityId);
            const waterCapacity = await this.calculateWaterCapacity(cityId);

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
        // Find total connectors vs occupied
        const stations = await EVChargingStation.find({ cityId, status: 'ONLINE' });
        const stationIds = stations.map(s => s._id);

        const connectors = await EVConnector.find({
            stationId: { $in: stationIds },
            status: { $in: ['AVAILABLE', 'OCCUPIED', 'RESERVED'] }
        });

        const total = connectors.length;
        if (total === 0) return { total: 0, utilized: 0, utilizationScore: 0, bottlenecks: [] };

        const occupied = connectors.filter(c => c.status === 'CHARGING' || c.status === 'RESERVED').length;
        const score = (occupied / total) * 100;

        // Find severely constrained stations
        const bottlenecks = [];
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

        if (total === 0) return { total: 0, utilized: 0, utilizationScore: 0, bottlenecks: [] };

        // "Utilized" logic: active duty = ON_ROUTE
        const active = vehicles.filter(v => (v.status as any) === 'ON_ROUTE').length;
        const maintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length;

        const safeCapacity = total - maintenance;
        const score = safeCapacity > 0 ? (active / safeCapacity) * 100 : 100;

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
        const transformers = await ElectricityAsset.find({ cityId, type: 'TRANSFORMER', status: { $in: ['ACTIVE', 'WARNING'] } });

        if (transformers.length === 0) return { totalCapacity: 0, currentLoad: 0, utilizationScore: 0, bottlenecks: [] };

        let maxLoad = 0;
        let currentLoadAgg = 0;
        let bottlenecks = [];

        for (const t of transformers) {
            const cap = t.capacity || 1000; // Assume 1000 KVA default if missing to prevent division by zero
            const cur = (t as any).currentLoad || 0;

            maxLoad += cap;
            currentLoadAgg += cur;

            if ((cur / cap) > 0.85) {
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
        const tanks = await WaterAsset.find({ cityId, type: 'STORAGE_TANK', status: { $in: ['ACTIVE', 'WARNING'] } });

        if (tanks.length === 0) return { totalCapacity: 0, currentLevel: 0, utilizationScore: 0, bottlenecks: [] };

        let maxCap = 0;
        let curLevel = 0;
        let bottlenecks = [];

        for (const t of tanks) {
            const cap = t.capacity || 10000;
            const cur = (t as any).currentLevel || 0;

            maxCap += cap;
            curLevel += cur;

            // In water storage, a bottleneck is usually LOW capacity rather than HIGH load.
            // i.e., utilized means full. But shortage means empty!
            if ((cur / cap) < 0.20) {
                bottlenecks.push({ assetId: t._id, name: t.name, fillLevel: Math.round((cur / cap) * 100) });
            }
        }

        const score = maxCap > 0 ? (curLevel / maxCap) * 100 : 0;

        return {
            totalStorageGallons: maxCap,
            currentReservedGallons: curLevel,
            fillScore: Math.round(score),
            bottlenecks,
            hasShortage: score <= 25 // Critical when tanks are under 25% average
        };
    }
}
