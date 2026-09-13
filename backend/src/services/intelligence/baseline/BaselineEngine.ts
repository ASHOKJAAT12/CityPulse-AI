import { FeatureExtractionEngine } from '../features/FeatureExtractionEngine';

export interface BaselineContext {
    mean: number;
    stdDev: number;
    upperBound: number;
    lowerBound: number;
}

export class BaselineEngine {
    /**
     * Given historical numeric values, establishes a statistical baseline
     * used for identifying anomalies. Expects data to be pre-normalized.
     * 
     * Uses a Z-Score bound approach (e.g. 3 standard deviations).
     */
    static establishNumericBaseline(historicalValues: number[], zScoreThreshold = 3): BaselineContext | null {
        if (!historicalValues || historicalValues.length < 5) { // Minimum samples required
            return null; // INSUFFICIENT_DATA
        }

        const mean = FeatureExtractionEngine.calculateSMA(historicalValues);
        const stdDev = FeatureExtractionEngine.calculateStandardDeviation(historicalValues, mean);

        return {
            mean,
            stdDev,
            lowerBound: mean - (zScoreThreshold * stdDev),
            upperBound: mean + (zScoreThreshold * stdDev)
        };
    }
}
