import { WaterAsset, WaterSupplySchedule, OptimizationRecommendation } from '../../models';
import { CapacityEngine } from './CapacityEngine';

export class WaterResourcePlanning {

    static async generateSupplyScheduleAdjustment(cityId: string, userId: string) {
        const caps = await CapacityEngine.getCityCapacityBaselines(cityId);

        const shortages = caps.domains.water.bottlenecks;

        if (shortages.length === 0) return null;

        // Pick the most critically depleted tank (lowest fill level first)
        const target = shortages.sort((a, b) => a.fillLevel - b.fillLevel)[0];

        const tank = await WaterAsset.findById(target.assetId);
        if (!tank) return null;

        // BUG FIX #12: Idempotency guard — prevent duplicate recommendations for same tank
        const existingRec = await OptimizationRecommendation.findOne({
            cityId,
            service: 'WATER',
            status: { $in: ['GENERATED', 'UNDER_REVIEW'] },
            'baseline.tankId': tank._id
        });

        if (existingRec) return existingRec;

        // Find active supply schedules for this tank
        // BUG FIX #13: WaterSupplySchedule may link via 'sensorId' or 'assetId' — use flexible filter
        const schedules = await WaterSupplySchedule.find({
            $or: [
                { assetId: tank._id },
                { tankId: tank._id }
            ],
            status: 'ACTIVE'
        });

        const baselineDuration = schedules.length > 0
            ? (schedules[0] as any).durationMinutes || (schedules[0] as any).scheduledDuration || 60
            : 60;

        const proposedDuration = baselineDuration + 30; // Extend pump window by 30 mins
        const estimatedFillIncrease = Math.min(100 - target.fillLevel, 15); // Realistic cap on fill improvement

        const recommendation = new OptimizationRecommendation({
            cityId,
            createdBy: userId,
            optimizationType: 'WATER_SCHEDULE',
            service: 'WATER',
            title: `Water Supply Increase: ${tank.name}`,
            summary: `Tank [${tank.name}] is critically low (${target.fillLevel}% fill). Recommend extending supply schedule from ${baselineDuration} to ${proposedDuration} minutes to replenish reserves.`,
            objective: 'MAXIMIZE_AVAILABILITY',
            baseline: {
                tankId: tank._id,
                tankName: tank.name,
                currentFillLevel: target.fillLevel,
                currentScheduleDuration: baselineDuration,
                activeSchedulesFound: schedules.length
            },
            recommendedPlan: {
                action: 'EXTEND_SCHEDULE',
                tankId: tank._id,
                currentDurationMinutes: baselineDuration,
                newDurationMinutes: proposedDuration
            },
            expectedImpact: {
                fillLevelIncreasePercent: estimatedFillIncrease,
                estimatedNewFillLevel: Math.min(100, target.fillLevel + estimatedFillIncrease),
                metric: 'RESERVE_CAPACITY'
            },
            constraints: {
                sourcePumpCapacity: true,
                maintenanceState: 'CLEARED'
            },
            evidence: {
                criticalThreshold: '<25%',
                currentLevel: target.fillLevel,
                criticalTanksCount: shortages.length
            },
            confidence: 95,
            score: 100 - target.fillLevel // Higher score for emptier tanks
        });

        await recommendation.save();
        return recommendation;
    }
}
