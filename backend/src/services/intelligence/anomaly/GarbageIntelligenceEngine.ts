import { AnomalyDetection } from '../../../models/AnomalyDetection';
import mongoose from 'mongoose';

export class GarbageIntelligenceEngine {
    static async detectAnomalies(payload: any): Promise<void> {
        // Detects if a garbage vehicle is suffering extreme delays
        // Usually, routes are expected to decrease their eta gradually. If speed is near zero 
        // with high remaining stops, we can flag a potential route delay.

        if (payload.speed !== undefined && payload.speed < 2 && payload.expectedRemainingMinutes > 120 && payload.remainingStops > 5) {

            const existingAnomaly = await AnomalyDetection.findOne({
                cityId: payload.cityId,
                service: 'GARBAGE',
                sourceType: 'VEHICLE',
                sourceId: payload.vehicleId,
                status: 'ACTIVE'
            });

            if (existingAnomaly) return; // Deduplicate

            const anomaly = new AnomalyDetection({
                cityId: payload.cityId,
                service: 'GARBAGE',
                sourceType: 'VEHICLE',
                sourceId: payload.vehicleId,
                metric: 'ROUTE_DELAY',
                observedValue: payload.expectedRemainingMinutes,
                expectedValue: 60, // Arbitrary benchmark for now
                deviation: payload.expectedRemainingMinutes - 60,
                severity: 'MEDIUM',
                confidence: 85,
                method: 'RULE_CORRELATION',
                status: 'ACTIVE',
                evidence: [
                    `Vehicle speed is extremely low (${payload.speed} km/h).`,
                    `ETA remains dangerously high (${payload.expectedRemainingMinutes} mins) for ${payload.remainingStops} remaining stops.`
                ]
            });

            await anomaly.save();

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { intelligenceBus } = require('../IntelligenceEventEmitter');
            intelligenceBus.emit('anomaly:detected', anomaly);
        }
    }
}
