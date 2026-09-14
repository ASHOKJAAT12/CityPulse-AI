import { intelligenceBus } from '../IntelligenceEventEmitter';
import { AnomalyEngine } from '../anomaly/AnomalyEngine';
import logger from '../../../utils/logger';
import { notificationService, NotificationAudience } from '../../notification/NotificationService';
import { getIO } from '../../../websocket';

// We import models to query recent history for baseline calculation
import { WaterSensorReading, ElectricitySensorReading, TrafficSensorReading, StreetlightSensorReading, EVStationReading } from '../../../models';

export interface TelemetryPayload {
    cityId: string;
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE';
    metric: string;
    sourceType: string;
    sourceId: string;
    value: number;
    unit?: string;
    recordedAt: Date;
}

export class TelemetryIntelligencePipeline {
    static init() {
        intelligenceBus.on('telemetry:ingested', async (payload: TelemetryPayload) => {
            try {
                await this.processTelemetry(payload);
            } catch (err) {
                logger.error(`AI Anomaly Engine Failure [Isolated] on ${payload.service}:`, err);
            }
        });

        intelligenceBus.on('report:created', async (report: any) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { CitizenReportIntelligenceEngine } = require('../anomaly/CitizenReportIntelligenceEngine');
                await CitizenReportIntelligenceEngine.detectHotspot(report);
            } catch (err) {
                logger.error('AI Report Engine Failure [Isolated]:', err);
            }
        });

        intelligenceBus.on('garbage:location-recorded', async (payload: any) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { GarbageIntelligenceEngine } = require('../anomaly/GarbageIntelligenceEngine');
                await GarbageIntelligenceEngine.detectAnomalies(payload);
            } catch (err) {
                logger.error('AI Garbage Engine Failure [Isolated]:', err);
            }
        });

        // ── 2. Intelligence Cascade Layer ────────────────────────
        intelligenceBus.on('anomaly:detected', async (anomaly: any) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { CorrelationEngine } = require('../correlation/CorrelationEngine');
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { RiskScoringEngine } = require('../risk/RiskScoringEngine');
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { PredictionEngine } = require('../prediction/PredictionEngine');
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { RecommendationEngine } = require('../recommendation/RecommendationEngine');

                const intelligenceEvent = await CorrelationEngine.correlate(anomaly);
                if (intelligenceEvent) {
                    await RiskScoringEngine.calculate(intelligenceEvent);
                    await RecommendationEngine.generate(intelligenceEvent);
                    await PredictionEngine.generate(intelligenceEvent);

                    intelligenceBus.emit('intelligence:event-created', intelligenceEvent);
                }
            } catch (err) {
                logger.error('Correlation Engine Failure:', err);
            }
        });

        // ── 3. Output & Notification Layer ───────────────────────
        intelligenceBus.on('intelligence:event-created', async (event: any) => {
            try {
                const io = getIO();
                if (io) {
                    io.to(`city:${event.cityId}`).emit('intelligence:event-updated', event);
                }

                if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
                    await notificationService.send({
                        cityId: event.cityId.toString(),
                        audience: NotificationAudience.CITY,
                        category: 'SYSTEM',
                        priority: event.severity,
                        title: `Intelligence Alert: ${event.title}`,
                        message: event.summary,
                        referenceType: 'INTELLIGENCE_EVENT',
                        referenceId: event._id.toString()
                    });
                }
            } catch (err) {
                logger.error('AI Broadcast Failure:', err);
            }
        });

        logger.info('TelemetryIntelligencePipeline initialized.');
    }

    private static async processTelemetry(payload: TelemetryPayload) {
        // Find recent historical data to establish baseline (Limit 50 for sliding window)
        // Usually, in a real system we'd use Redis or aggregated views for speed.
        let historyModels: number[] = [];

        if (payload.service === 'WATER') {
            const history = await WaterSensorReading.find({ sensorId: payload.sourceId })
                .sort({ recordedAt: -1 }).limit(50).lean();
            historyModels = history.map(r => r.value).reverse();
        } else if (payload.service === 'ELECTRICITY') {
            const history = await ElectricitySensorReading.find({ sensorId: payload.sourceId })
                .sort({ recordedAt: -1 }).limit(50).lean();
            historyModels = history.map(r => r.value).reverse();
        } else if (payload.service === 'TRAFFIC') {
            const history = await TrafficSensorReading.find({ sensorId: payload.sourceId })
                .sort({ recordedAt: -1 }).limit(50).lean();
            historyModels = history.map(r => r.value).reverse();
        } else if (payload.service === 'STREETLIGHT') {
            const history = await StreetlightSensorReading.find({ sensorId: payload.sourceId })
                .sort({ recordedAt: -1 }).limit(50).lean();
            historyModels = history.map(r => r.value).reverse();
        } else if (payload.service === 'EV') {
            const history = await EVStationReading.find({ stationId: payload.sourceId })
                .sort({ recordedAt: -1 }).limit(50).lean();
            historyModels = history.map((r: any) => payload.metric === 'TEMPERATURE' ? r.temperature : r.powerKw).filter(x => x !== undefined).reverse();
        }

        // Pass to standard Anomaly Engine
        const anomaly = await AnomalyEngine.detect({
            cityId: payload.cityId,
            service: payload.service,
            metric: payload.metric,
            sourceType: payload.sourceType,
            sourceId: payload.sourceId,
            value: payload.value,
            unit: payload.unit,
            historicalData: historyModels
        });

        if (anomaly) {
            // Anomaly detected! We emit another internal event for Correlation Engine
            intelligenceBus.emit('anomaly:detected', anomaly);
        }
    }
}
