import { TrafficRoad, TrafficIntersection, OptimizationRecommendation } from '../../models';

export class TrafficRoutingOptimization {

    static async generateSignalTimingPlan(cityId: string, userId: string) {

        // 1. Fetch Roads with highly congested intersections
        const roads = await TrafficRoad.find({
            cityId,
            currentCongestionLevel: { $in: ['HEAVY', 'SEVERE'] }
        });

        if (roads.length === 0) return null;

        // BUG FIX #6: Sort was INVERTED. Slowest road has LOWEST averageSpeed.
        // We want ascending sort (smallest speed first) then take [0] — the worst road.
        const worstRoad = roads.sort((a, b) => (a.averageSpeed || 0) - (b.averageSpeed || 0))[0];

        // 2. Fetch Intersection linked to this road
        const intersection = await TrafficIntersection.findOne({
            cityId,
            _id: { $in: (worstRoad as any).intersections || [] }
        });

        if (!intersection) return null;

        // BUG FIX #7: Idempotency guard — don't create duplicate recommendations
        // for the same intersection if one already exists in GENERATED/UNDER_REVIEW state.
        const existingRec = await OptimizationRecommendation.findOne({
            cityId,
            service: 'TRAFFIC',
            status: { $in: ['GENERATED', 'UNDER_REVIEW'] },
            'baseline.intersectionId': intersection._id
        });

        if (existingRec) return existingRec;

        const currentGreenRatio = 0.4;
        const proposedGreenRatio = 0.6;
        const baselineDelay = 15; // mins average wait
        const expectedDelay = 9;

        const recommendation = new OptimizationRecommendation({
            cityId,
            createdBy: userId,
            optimizationType: 'TRAFFIC_ROUTE',
            service: 'TRAFFIC',
            title: `Signal Timing Revision: ${intersection.name}`,
            summary: `Increase green-light assignment ratio at ${intersection.name} from 40% to 60% to flush severe congestion on connected arterial roads.`,
            objective: 'MINIMIZE_DELAY',
            baseline: {
                intersectionId: intersection._id,
                roadId: worstRoad._id,
                currentGreenRatio,
                roadName: worstRoad.name,
                congestionLevel: worstRoad.currentCongestionLevel
            },
            recommendedPlan: {
                action: 'ADJUST_SIGNAL_TIMING',
                intersectionId: intersection._id,
                newGreenRatio: proposedGreenRatio
            },
            expectedImpact: {
                delayReductionMinutes: baselineDelay - expectedDelay,
                congestionClearanceTime: '45 mins',
                metric: 'FLOW_RATE_IMPROVED'
            },
            constraints: {
                pedestrianCrossingsActive: true,
                crossTrafficImpact: 'MODERATE'
            },
            evidence: {
                triggerRoad: worstRoad.name,
                congestion: worstRoad.currentCongestionLevel,
                averageSpeedKmph: worstRoad.averageSpeed
            },
            confidence: 80,
            score: 80
        });

        await recommendation.save();
        return recommendation;
    }
}
