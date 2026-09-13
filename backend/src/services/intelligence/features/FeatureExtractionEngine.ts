export class FeatureExtractionEngine {
    /**
     * Calculates the Simple Moving Average (SMA) of an array of numbers.
     */
    static calculateSMA(values: number[]): number {
        if (!values || values.length === 0) return 0;
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
    }

    /**
     * Calculates the Standard Deviation of an array of numbers.
     */
    static calculateStandardDeviation(values: number[], mean?: number): number {
        if (!values || values.length === 0) return 0;
        const m = mean !== undefined ? mean : this.calculateSMA(values);
        const squareDiffs = values.map((val) => {
            const diff = val - m;
            return diff * diff;
        });
        const avgSquareDiff = this.calculateSMA(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calculates Z-Score of a given value against a dataset.
     */
    static calculateZScore(value: number, history: number[]): number {
        if (!history || history.length === 0) return 0;
        const mean = this.calculateSMA(history);
        const stdDev = this.calculateStandardDeviation(history, mean);
        if (stdDev === 0) return 0;
        return (value - mean) / stdDev;
    }

    /**
     * Calculates the rate of change between current and previous value (as a percentage).
     */
    static calculateRateOfChange(currentValue: number, previousValue: number): number {
        if (!previousValue || previousValue === 0) return 0;
        return ((currentValue - previousValue) / previousValue) * 100;
    }

    /**
     * Determines the percentage deviation of a value from the baseline mean calculated
     * from historical values.
     */
    static calculateDeviationPercentage(value: number, historicalValues: number[]): number {
        if (!historicalValues || historicalValues.length === 0) return 0;
        const baseline = this.calculateSMA(historicalValues);
        if (baseline === 0) return 0;
        return ((value - baseline) / baseline) * 100;
    }
}
