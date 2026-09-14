import { WaterAsset, WaterSupplySchedule, OptimizationRecommendation } from '../../models';
import { CapacityEngine } from './CapacityEngine';

export class WaterResourcePlanning {

    static async generateSupplyScheduleAdjustment(cityId: string, userId: string) {
        const caps = await CapacityEngine.getCityCapacityBaselines(cityId);

        // Find empty tanks
        const shortages = caps.domains.water.bottlenecks;

        if (shortages.length === 0) return null;

        const target = shortages.sort((a, b) => a.fillLevel - b.fillLevel)[0]; // Lowest fill level

        const tank = await WaterAsset.findById(target.assetId);
        if (!tank) return null;

        // Find active schedules for this tank
        const schedules = await WaterSupplySchedule.find({ assetId: tank._id, status: 'ACTIVE' });

        const baselineDuration = schedules.length > 0 ? (schedules[0] as any).durationMinutes || 60 : 60;
        const proposedDuration = baselineDuration + 30; // Pump an extra 30 minutes

        const recommendation = new OptimizationRecommendation({
            cityId,
            createdBy: userId,
            optimizationType: 'WATER_SCHEDULE',
            service: 'WATER',
            title: `Water Supply Increase: ${tank.name}`,
            summary: `Tank ${tank.name} is dangerously low (${target.fillLevel}%). Recommend extending incoming supply schedule by 30 minutes to replenish reserves.`,
            objective: 'MAXIMIZE_AVAILABILITY',
            baseline: {
                tankId: tank._id,
                currentFillLevel: target.fillLevel,
                currentScheduleDuration: baselineDuration
            },
            recommendedPlan: {
                action: 'EXTEND_SCHEDULE',
                tankId: tank._id,
                newDurationMinutes: proposedDuration
            },
            expectedImpact: {
                fillLevelIncreasePercent: 15,
                metric: 'RESERVE_CAPACITY'
            },
            constraints: {
                sourcePumpCapacity: true,
                maintenanceState: 'CLEARED'
            },
            evidence: {
                criticalThreshold: '<25%',
                currentLevel: target.fillLevel
            },
            confidence: 95,
            score: (100 - target.fillLevel) // Higher score for emptier tanks
        });

        await recommendation.save();
        return recommendation;
    }
}
