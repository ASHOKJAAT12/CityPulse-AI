import {
    OptimizationRecommendation,
    OptimizationScenario
} from '../../models';
import { GarbageOptimizationEngine } from './GarbageOptimizationEngine';
import { TrafficRoutingOptimization } from './TrafficRoutingOptimization';
import { EVCapacityOptimization } from './EVCapacityOptimization';
import { WaterResourcePlanning } from './WaterResourcePlanning';

export class OptimizationRecommendationEngine {

    /**
     * Executes parallel generative heuristic engines, returning newly built human-actionable optimization plans.
     */
    static async generateCrossServiceRecommendations(cityId: string, userId: string): Promise<any[]> {
        const promises = [
            GarbageOptimizationEngine.generateVehicleReallocation(cityId, userId).catch(() => null),
            TrafficRoutingOptimization.generateSignalTimingPlan(cityId, userId).catch(() => null),
            EVCapacityOptimization.generateStationLoadBalancing(cityId, userId).catch(() => null),
            WaterResourcePlanning.generateSupplyScheduleAdjustment(cityId, userId).catch(() => null)
        ];

        const results = await Promise.all(promises);

        // Filter out nulls (meaning the engine found no bottlenecks)
        return results.filter(r => r !== null);
    }

    /**
     * Simulation Execution Layer allowing users to configure 'What-If' constraints loosely defined as parameters.
     * Prevents overriding or destroying actual physical databases while evaluating outcomes statistically.
     */
    static async runWhatIfScenario(scenarioId: string) {
        const scenario = await OptimizationScenario.findById(scenarioId);
        if (!scenario) throw new Error('Scenario not found');

        // Lock execution
        scenario.status = 'RUNNING';
        await scenario.save();

        try {
            // Very simple simulated heuristics. We look at the 'inputs' parameters.
            // Example Inputs: { "increaseTrafficBy": 50, "service": "TRAFFIC" }

            const inputs = scenario.inputs || {};
            let resultBaseline = {};
            let resultScenario = {};
            let resultImpact = {};

            if (scenario.scenarioType === 'TRAFFIC_SURGE') {
                const increase = inputs.increasePercentage || 25;
                resultBaseline = { averageCitySpeedKmph: 45, maxIntersectionsOverloaded: 3 };
                resultScenario = {
                    averageCitySpeedKmph: Math.max(5, 45 - (increase * 0.4)),
                    maxIntersectionsOverloaded: Math.ceil(3 + (increase * 0.1))
                };
                resultImpact = {
                    flowSeverity: increase > 30 ? 'CRITICAL' : 'ELEVATED'
                };
            }
            else if (scenario.scenarioType === 'GARBAGE_VEHICLE_SHORTAGE') {
                const shortedCount = inputs.offlineVehicles || 2;
                resultBaseline = { fleetEfficiency: '92%', expectedDelays: 1 };
                resultScenario = {
                    fleetEfficiency: `${Math.max(50, 92 - (shortedCount * 12))}%`,
                    expectedDelays: 1 + shortedCount
                };
                resultImpact = {
                    cascadeFailureRisk: shortedCount > 3 ? 'HIGH' : 'LOW'
                };
            }
            else {
                // Fallback for general resource modification testing
                resultBaseline = { state: 'NOMINAL', metric: 100 };
                resultScenario = { state: 'SIMULATED_DEGRADATION', metric: 100 - (inputs.impactFactor || 15) };
                resultImpact = { observation: 'Theoretical capacity breached.' };
            }

            scenario.result = {
                baseline: resultBaseline,
                simulation: resultScenario,
                impact: resultImpact
            };

            scenario.status = 'COMPLETED';
            await scenario.save();

            return scenario;

        } catch (error) {
            scenario.status = 'FAILED';
            await scenario.save();
            throw error;
        }
    }
}
