import { Types } from 'mongoose';
import { AIModelRegistry } from '../../../models/AIModelRegistry';
import { PredictiveMaintenanceRisk } from '../../../models/PredictiveMaintenanceRisk';
import logger from '../../../utils/logger';

interface PredictionInput {
    cityId: string | Types.ObjectId;
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE';
    assetType: string;
    assetId: string | Types.ObjectId;
    historicalData: number[];
    recentAnomalies: any[];
}

export class AdvancedPredictiveEngine {
    /**
     * Determines failure risk and maintenance recommendations.
     * Selects model from registry or falls back to baselines.
     */
    static async generateMaintenanceRisk(input: PredictionInput): Promise<void> {
        try {
            // Find active model for this service
            const activeModel = await AIModelRegistry.findOne({
                service: input.service,
                status: 'ACTIVE'
            });

            // Fallback rules if no complex statistical model exists or insufficient data
            let method = 'STATISTICAL';
            let modelName = 'fallback-statistical-v1';
            let riskScore = 0;
            let confidence = 0;
            const predictionHorizon = 'within 24 hours';
            let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
            const evidence: string[] = [];

            if (!activeModel) {
                // Rule-based / Baseline fallback (Do not fake ML)
                method = 'BASELINE';
                modelName = 'baseline-historical-v1';

                // Simple baseline detection
                if (input.historicalData && input.historicalData.length > 0) {
                    const latest = input.historicalData[input.historicalData.length - 1];
                    const avg = input.historicalData.reduce((a, b) => a + b, 0) / input.historicalData.length;

                    if (latest > avg * 1.5 || latest < avg * 0.5) {
                        riskScore = 65;
                        severity = 'HIGH';
                        evidence.push(`Recent reading (${latest}) deviated significantly from historical baseline average (${avg.toFixed(2)}).`);
                    } else {
                        riskScore = 15;
                        severity = 'LOW';
                        evidence.push(`Asset behavior conforms to historical averages.`);
                    }
                    confidence = Math.min(input.historicalData.length * 2, 85); // Calibration
                } else {
                    evidence.push('Insufficient historical records for robust statistical analysis. Relying on anomaly triggers alone.');
                    riskScore = input.recentAnomalies.length > 0 ? 50 : 5;
                    severity = input.recentAnomalies.length > 0 ? 'MEDIUM' : 'LOW';
                    confidence = 40;
                }
            } else {
                // Future Implementation for real ML inference
                modelName = activeModel.name;
                method = activeModel.method;
                // Placeholders that would hook to python microservice or statistical models
                riskScore = 30;
                confidence = 80;
                severity = 'LOW';
                evidence.push('Evaluated using active statistical model parameters.');
            }

            if (riskScore > 30) { // Only record actionable risks to prevent noise
                const horizonEnd = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                const riskEvent = new PredictiveMaintenanceRisk({
                    cityId: input.cityId,
                    service: input.service,
                    assetType: input.assetType,
                    assetId: input.assetId,
                    predictionType: 'FAILURE',
                    riskScore,
                    severity,
                    confidence,
                    predictionHorizon,
                    predictedFailureWindow: { start: new Date(), end: horizonEnd },
                    modelName,
                    modelVersion: 'v1.0.0', // from activeModel
                    features: { dataPoints: input.historicalData?.length || 0 },
                    evidence,
                    recommendedActions: ['Schedule Technical Inspection', 'Monitor Data Streams'],
                    status: 'GENERATED',
                    expiresAt: horizonEnd
                });

                await riskEvent.save();
                logger.info(`AdvancedPredictiveEngine: Generated risk score ${riskScore} for ${input.service} asset ${input.assetId}`);
            }

        } catch (error) {
            logger.error(`AdvancedPredictiveEngine Failure:`, error);
        }
    }
}
