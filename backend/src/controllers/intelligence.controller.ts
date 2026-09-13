import { Request, Response } from 'express';
import { IntelligenceEvent, AnomalyDetection, RiskAssessment, Prediction, Recommendation } from '../models';
import { AppError } from '../utils/AppError';

export class IntelligenceController {
    static async getIntelligenceEvents(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const events = await IntelligenceEvent.find({ cityId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ success: true, data: events });
    }

    static async getIntelligenceDetails(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const { id } = req.params;

        const event = await IntelligenceEvent.findOne({ _id: id, cityId }).lean() as any;
        if (!event) throw AppError.notFound('Intelligence Event not found');

        const [anomalies, risks, predictions, recommendations] = await Promise.all([
            // In a real system, we might link anomalies directly. For now, fetch recent anomalies for same service
            AnomalyDetection.find({ cityId, service: event.service }).sort({ detectedAt: -1 }).limit(10).lean(),
            RiskAssessment.find({ sourceId: event._id }).lean(),
            Prediction.find({ sourceId: event._id }).lean(),
            Recommendation.find({ intelligenceEventId: event._id }).lean()
        ]);

        res.json({
            success: true,
            data: {
                event,
                anomalies,
                risks,
                predictions,
                recommendations
            }
        });
    }

    static async getCityHealthOverview(req: Request, res: Response) {
        const cityId = req.user?.cityId;

        // Aggregate risk across the entire city based on active intelligence events
        const activeEvents = await IntelligenceEvent.find({
            cityId,
            status: { $in: ['DETECTED', 'UNDER_REVIEW', 'ACTION_RECOMMENDED'] }
        }).lean();

        let totalRisk = 0;
        let criticalCount = 0;

        const serviceRisks: Record<string, number> = {
            'WATER': 0, 'ELECTRICITY': 0, 'TRAFFIC': 0, 'GARBAGE': 0, 'STREETLIGHT': 0, 'EV': 0
        };

        for (const ev of activeEvents) {
            totalRisk += ev.riskScore || 0;
            if (ev.severity === 'CRITICAL') criticalCount++;
            if (serviceRisks[ev.service] !== undefined) {
                serviceRisks[ev.service] += (ev.riskScore || 10);
            }
        }

        const healthScore = Math.max(0, 100 - (totalRisk / 10));

        res.json({
            success: true,
            data: {
                healthScore: Math.round(healthScore),
                activeAlerts: activeEvents.length,
                criticalAlerts: criticalCount,
                serviceRisks
            }
        });
    }

    // Human in the loop resolution
    static async updateEventStatus(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const { id } = req.params;
        const { status, operatorNotes } = req.body;

        const event = await IntelligenceEvent.findOneAndUpdate(
            { _id: id, cityId },
            { $set: { status, updatedAt: new Date() } },
            { new: true }
        );

        if (!event) throw AppError.notFound('Intelligence Event not found');

        // Optional: Save interaction to IntelligenceFeedback for tuning
        const { IntelligenceFeedback } = require('../../models/IntelligenceFeedback');
        await IntelligenceFeedback.create({
            cityId,
            intelligenceEventId: event._id,
            operatorId: (req.user as any)?.id,
            actionTaken: status,
            notes: operatorNotes,
            feedbackScore: status === 'RESOLVED' ? 1 : 0
        });

        res.json({ success: true, data: event });
    }
}
