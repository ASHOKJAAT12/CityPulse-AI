import { EVChargingStation, OptimizationRecommendation } from '../../models';
import { CapacityEngine } from './CapacityEngine';

export class EVCapacityOptimization {

    static async generateStationLoadBalancing(cityId: string, userId: string) {
        const cap = await CapacityEngine.getCityCapacityBaselines(cityId);
        const overloaded = cap.domains.ev.bottlenecks;

        if (overloaded.length === 0) return null;

        // Pick worst bottleneck (highest utilization)
        const target = overloaded.sort((a, b) => b.utilization - a.utilization)[0];

        const station = await EVChargingStation.findById(target.stationId);
        if (!station) return null;

        // BUG FIX #10: Idempotency guard — prevent spam creating duplicate recommendations
        const existingRec = await OptimizationRecommendation.findOne({
            cityId,
            service: 'EV',
            status: { $in: ['GENERATED', 'UNDER_REVIEW'] },
            'baseline.targetStationId': station._id
        });

        if (existingRec) return existingRec;

        // Find nearest underutilized station for diversion
        // BUG FIX #11: Filter out already-overloaded stations from diversion candidates
        const overloadedIds = new Set(overloaded.map(o => String(o.stationId)));
        const diversions = await EVChargingStation.find({
            cityId,
            status: 'ONLINE',
            _id: { $ne: station._id }
        });

        const diversionStation = diversions.find(d => !overloadedIds.has(String(d._id)));
        if (!diversionStation) return null; // No viable diversion target

        const recommendation = new OptimizationRecommendation({
            cityId,
            createdBy: userId,
            optimizationType: 'EV_CAPACITY',
            service: 'EV',
            title: `EV Load Balancing: Divert From ${station.name}`,
            summary: `Station [${station.name}] is at ${target.utilization}% utilization. Recommend dynamic routing to steer users toward [${diversionStation.name}] to balance grid load.`,
            objective: 'MAXIMIZE_RESOURCE_UTILIZATION',
            baseline: {
                targetStationId: station._id,
                targetStationName: station.name,
                targetUtilization: target.utilization,
                diversionStationId: diversionStation._id,
                diversionStationName: diversionStation.name
            },
            recommendedPlan: {
                action: 'DIVERT_TRAFFIC',
                targetStationId: station._id,
                diversionStationId: diversionStation._id
            },
            expectedImpact: {
                utilizationReductionPercent: 20,
                estimatedNewUtilization: Math.max(0, target.utilization - 20),
                metric: 'UTILIZATION_BALANCED'
            },
            constraints: {
                diversionCapacityAvailable: true
            },
            evidence: {
                bottleneckThreshold: '>85%',
                currentLoad: target.utilization,
                overloadedStationsCount: overloaded.length
            },
            confidence: 90,
            score: target.utilization
        });

        await recommendation.save();
        return recommendation;
    }
}
