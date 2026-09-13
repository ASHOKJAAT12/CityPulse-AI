import { IntelligenceEvent } from '../../../models/IntelligenceEvent';
import { RiskAssessment } from '../../../models/RiskAssessment';
import mongoose from 'mongoose';

export class RiskScoringEngine {
    static async calculate(intelligenceEvent: any): Promise<void> {
        let impactScore = 50;
        let likelihoodScore = intelligenceEvent.confidence;

        // Arbitrary business logic for Risk Scoring based on Service Type
        if (intelligenceEvent.service === 'ELECTRICITY') impactScore += 30; // Grid is critical
        if (intelligenceEvent.service === 'WATER') impactScore += 25; // Life essential
        if (intelligenceEvent.severity === 'CRITICAL') impactScore += 20;

        impactScore = Math.min(100, impactScore);

        // Core formula: Risk = (Impact * Likelihood) / 100
        const riskScore = Math.round((impactScore * likelihoodScore) / 100);

        let finalSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (riskScore >= 75) finalSeverity = 'CRITICAL';
        else if (riskScore >= 50) finalSeverity = 'HIGH';
        else if (riskScore >= 25) finalSeverity = 'MEDIUM';

        // Update the event
        intelligenceEvent.riskScore = riskScore;
        if (finalSeverity !== 'LOW') {
            intelligenceEvent.severity = finalSeverity; // Upgrade severity if risk is massive
        }
        await intelligenceEvent.save();

        // Check if we need to actively spawn a RiskAssessment Model
        if (riskScore >= 50) {
            const existingRisk = await RiskAssessment.findOne({
                cityId: intelligenceEvent.cityId,
                sourceId: intelligenceEvent._id,
                status: 'ACTIVE'
            });

            if (!existingRisk) {
                const assessment = new RiskAssessment({
                    cityId: intelligenceEvent.cityId,
                    service: intelligenceEvent.service,
                    sourceType: 'INTELLIGENCE_EVENT',
                    sourceId: intelligenceEvent._id,
                    riskType: 'SERVICE_DEGRADATION',
                    riskScore,
                    severity: finalSeverity,
                    confidence: intelligenceEvent.confidence,
                    impactScore,
                    likelihoodScore,
                    evidence: intelligenceEvent.evidence,
                    status: 'ACTIVE'
                });
                await assessment.save();
            }
        }
    }
}
