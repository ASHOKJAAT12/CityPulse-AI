import { AdvancedPredictiveEngine } from './AdvancedPredictiveEngine';
import { TrafficSensorReading, WaterSensorReading, ElectricitySensorReading, StreetlightSensorReading, EVStationReading } from '../../../models';

export class PredictionEngine {
    static async generate(intelligenceEvent: any): Promise<void> {
        // Prepare historical telemetry based on service to feed the Advanced Engine
        let historicalData: number[] = [];

        try {
            if (intelligenceEvent.service === 'WATER') {
                const history = await WaterSensorReading.find({ sensorId: intelligenceEvent.sourceId }).sort({ recordedAt: -1 }).limit(100).lean();
                historicalData = history.map(r => r.value).reverse();
            } else if (intelligenceEvent.service === 'ELECTRICITY') {
                const history = await ElectricitySensorReading.find({ sensorId: intelligenceEvent.sourceId }).sort({ recordedAt: -1 }).limit(100).lean();
                historicalData = history.map(r => r.value).reverse();
            } else if (intelligenceEvent.service === 'TRAFFIC') {
                const history = await TrafficSensorReading.find({ sensorId: intelligenceEvent.sourceId }).sort({ recordedAt: -1 }).limit(100).lean();
                historicalData = history.map(r => r.value).reverse();
            } else if (intelligenceEvent.service === 'STREETLIGHT') {
                const history = await StreetlightSensorReading.find({ sensorId: intelligenceEvent.sourceId }).sort({ recordedAt: -1 }).limit(100).lean();
                historicalData = history.map(r => r.value).reverse();
            } else if (intelligenceEvent.service === 'EV') {
                const history = await EVStationReading.find({ stationId: intelligenceEvent.sourceId }).sort({ recordedAt: -1 }).limit(100).lean();
                historicalData = history.map((r: any) => r.powerKw || r.temperature || 0).reverse();
            }

            // Pipe into the newly implemented Baseline / Evaluation Engine
            await AdvancedPredictiveEngine.generateMaintenanceRisk({
                cityId: intelligenceEvent.cityId,
                service: intelligenceEvent.service,
                assetType: 'INFRASTRUCTURE_ASSET',
                assetId: intelligenceEvent.sourceId,
                historicalData,
                recentAnomalies: [intelligenceEvent] // Treat uncorrelated AI risk as recent anomaly
            });
        } catch (error) {
            console.error('PredictionEngine Data Linkage Error:', error);
        }
    }
}
