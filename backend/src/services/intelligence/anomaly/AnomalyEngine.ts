import { AnomalyDetection, IAnomalyDetection } from '../../../models/AnomalyDetection';
import { BaselineEngine } from '../baseline/BaselineEngine';
import { DataNormalizationEngine } from '../normalization/DataNormalizationEngine';
import { FeatureExtractionEngine } from '../features/FeatureExtractionEngine';
import mongoose from 'mongoose';

export interface AnomalyInput {
    cityId: string;
    service: string;
    metric: string; // e.g. "PRESSURE", "LOAD", "SPEED"
    sourceType: string; // e.g. "SENSOR", "VEHICLE"
    sourceId: string;
    value: number;
    unit?: string;
    historicalData?: number[];
}

export class AnomalyEngine {

    /**
     * Central anomaly detection pipeline.
     */
    static async detect(input: AnomalyInput): Promise<IAnomalyDetection | null> {
        // 1. Normalize
        const normalizedValue = DataNormalizationEngine.normalize(input.service, input.metric, input.value, input.unit);
        let normalizedHistory: number[] = [];

        if (input.historicalData && input.historicalData.length > 0) {
            normalizedHistory = input.historicalData.map(v =>
                DataNormalizationEngine.normalize(input.service, input.metric, v, input.unit)
            );
        }

        // 2. Extract Features & Establish Baseline
        const baseline = BaselineEngine.establishNumericBaseline(normalizedHistory);

        // 3. Evaluate Thresholds dynamically per dataset
        if (!baseline) {
            // INSUFFICIENT_DATA scenario
            return null;
        }

        let isAnomaly = false;
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        let deviationAmount = 0;

        if (normalizedValue > baseline.upperBound) {
            isAnomaly = true;
            deviationAmount = normalizedValue - baseline.upperBound;
            severity = this.calculateSeverity(deviationAmount, baseline.stdDev);
        } else if (normalizedValue < baseline.lowerBound) {
            isAnomaly = true;
            deviationAmount = baseline.lowerBound - normalizedValue;
            severity = this.calculateSeverity(deviationAmount, baseline.stdDev);
        }

        if (!isAnomaly) return null;

        // Ensure we don't spam duplicate standard anomalies (Deduplication)
        const recent = await AnomalyDetection.findOne({
            cityId: input.cityId,
            service: input.service,
            sourceType: input.sourceType,
            sourceId: input.sourceId,
            metric: input.metric,
            status: 'ACTIVE'
        });

        if (recent) {
            // Found a continuing anomaly. We can just update observed value or ignore.
            recent.observedValue = normalizedValue;
            recent.expectedValue = baseline.mean;
            recent.deviation = deviationAmount;
            recent.updatedAt = new Date();
            // Up-tick severity if worsening
            if (this.severityToScore(severity) > this.severityToScore(recent.severity)) {
                recent.severity = severity;
            }
            await recent.save();
            return recent;
        }

        // Create new anomaly
        const zScore = FeatureExtractionEngine.calculateZScore(normalizedValue, normalizedHistory);
        const confidenceScore = Math.min(100, Math.floor(Math.abs(zScore) * 20 + (normalizedHistory.length / 5))); // Fake confident heuristics

        const anomaly = new AnomalyDetection({
            cityId: new mongoose.Types.ObjectId(input.cityId),
            service: input.service,
            sourceType: input.sourceType,
            sourceId: new mongoose.Types.ObjectId(input.sourceId),
            metric: input.metric,
            observedValue: normalizedValue,
            expectedValue: baseline.mean,
            deviation: deviationAmount,
            severity,
            confidence: confidenceScore,
            method: 'Z_SCORE',
            status: 'ACTIVE',
            evidence: [
                `Observed normalized value: ${normalizedValue.toFixed(2)}`,
                `Expected statistical bounds: [${baseline.lowerBound.toFixed(2)} — ${baseline.upperBound.toFixed(2)}]`,
                `Deviation context (Z-Score): ${zScore.toFixed(2)}`
            ]
        });

        await anomaly.save();
        return anomaly;
    }

    private static calculateSeverity(deviation: number, stdDev: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
        if (stdDev === 0) return 'LOW';
        const stDeviations = deviation / stdDev;
        if (stDeviations > 5) return 'CRITICAL';
        if (stDeviations > 3) return 'HIGH';
        if (stDeviations > 1.5) return 'MEDIUM';
        return 'LOW';
    }

    private static severityToScore(severity: string): number {
        switch (severity) {
            case 'CRITICAL': return 4;
            case 'HIGH': return 3;
            case 'MEDIUM': return 2;
            case 'LOW': return 1;
            default: return 0;
        }
    }
}
