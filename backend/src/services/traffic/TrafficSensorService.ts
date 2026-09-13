import { TrafficSensor, TrafficSensorReading, TrafficCongestionEvent, TrafficRoad, TrafficIntersection } from '../../models';
import { AppError as ApiError } from '../../utils/AppError';
import { getIO } from '../../websocket';
import { WS_EVENTS } from '../../constants/events';

export class TrafficSensorService {
    // CRUD Sensors
    static async getSensors(cityId: string, query: any = {}) {
        return await TrafficSensor.find({ cityId, ...query })
            .populate('roadId', 'name')
            .populate('intersectionId', 'name')
            .sort({ createdAt: -1 });
    }

    static async createSensor(cityId: string, data: any) {
        const existing = await TrafficSensor.findOne({ cityId, sensorCode: data.sensorCode });
        if (existing) throw ApiError.badRequest('Sensor code must be unique');

        const sensor = new TrafficSensor({ cityId, ...data });
        return await sensor.save();
    }

    static async updateSensor(cityId: string, sensorId: string, data: any) {
        const sensor = await TrafficSensor.findOneAndUpdate(
            { _id: sensorId, cityId },
            { $set: data },
            { new: true }
        );
        if (!sensor) throw ApiError.notFound('Sensor not found');
        return sensor;
    }

    static async deleteSensor(cityId: string, sensorId: string) {
        const deleted = await TrafficSensor.findOneAndDelete({ _id: sensorId, cityId });
        if (!deleted) throw ApiError.notFound('Sensor not found');
        return deleted;
    }

    // Ingestion Engine
    static async ingestReading(cityId: string, sensorId: string, data: { value: number; recordedAt?: string; source?: 'SENSOR' | 'ADMIN' | 'API' | 'SIMULATOR' }) {
        const sensor = await TrafficSensor.findOne({ _id: sensorId, cityId });
        if (!sensor || !sensor.active) throw ApiError.notFound('Sensor not found or inactive');

        const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();

        const reading = new TrafficSensorReading({
            cityId,
            sensorId: sensor._id,
            roadId: sensor.roadId,
            intersectionId: sensor.intersectionId,
            value: data.value,
            unit: sensor.unit,
            recordedAt,
            source: data.source || 'SENSOR'
        });

        await reading.save();

        // Update sensor latest reading
        sensor.currentValue = data.value;
        sensor.lastReadingAt = recordedAt;
        await sensor.save();

        // Broadcast to websocket
        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.TRAFFIC_READING_UPDATED, {
                sensorId,
                value: data.value,
                unit: sensor.unit,
                recordedAt
            });
        }

        // Fire status engine
        await this.evaluateCongestion(sensor, reading);

        return reading;
    }

    // Rule-Based Traffic Engine (Not AI, deterministic logic)
    static async evaluateCongestion(sensor: any, reading: any) {
        let newStatus: 'FREE_FLOW' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE' | 'UNKNOWN' = 'UNKNOWN';
        let isCongested = false;
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

        // Example Algorithm Constraints based on TYPE
        if (sensor.sensorType === 'SPEED') {
            if (sensor.minThreshold && reading.value < sensor.minThreshold) {
                // Hard congestion due to low speed
                isCongested = true;
                if (reading.value < (sensor.minThreshold * 0.3)) {
                    newStatus = 'SEVERE';
                    severity = 'CRITICAL';
                } else if (reading.value < (sensor.minThreshold * 0.7)) {
                    newStatus = 'HEAVY';
                    severity = 'HIGH';
                } else {
                    newStatus = 'MODERATE';
                    severity = 'MEDIUM';
                }
            } else {
                newStatus = 'FREE_FLOW';
            }
        } else if (sensor.sensorType === 'VEHICLE_COUNT' || sensor.sensorType === 'TRAFFIC_DENSITY' || sensor.sensorType === 'OCCUPANCY') {
            if (sensor.maxThreshold && reading.value > sensor.maxThreshold) {
                isCongested = true;
                const ratio = reading.value / sensor.maxThreshold;
                if (ratio > 1.5) {
                    newStatus = 'SEVERE';
                    severity = 'CRITICAL';
                } else if (ratio > 1.2) {
                    newStatus = 'HEAVY';
                    severity = 'HIGH';
                } else {
                    newStatus = 'MODERATE';
                    severity = 'MEDIUM';
                }
            } else {
                newStatus = 'FREE_FLOW';
            }
        }

        if (newStatus === 'UNKNOWN') return; // Cannot determine deterministically

        // Update Road or Intersection state synchronously
        if (sensor.roadId) {
            await TrafficRoad.findByIdAndUpdate(sensor.roadId, { trafficStatus: newStatus });
            const io = getIO();
            if (io) {
                io.to(`city:${sensor.cityId}`).emit(WS_EVENTS.TRAFFIC_ROAD_STATUS_UPDATED, { roadId: sensor.roadId, status: newStatus });
            }
        } else if (sensor.intersectionId) {
            await TrafficIntersection.findByIdAndUpdate(sensor.intersectionId, { trafficStatus: newStatus });
        }

        // Handle Active Congestion Events
        if (isCongested) {
            // Find an active congestion on this entity
            const query: any = { cityId: sensor.cityId, status: 'ACTIVE' };
            if (sensor.roadId) query.roadId = sensor.roadId;
            else query.intersectionId = sensor.intersectionId;

            let activeEvent = await TrafficCongestionEvent.findOne(query);

            if (activeEvent) {
                // Update severity if escalated
                if (activeEvent.severity !== severity || activeEvent.trafficStatus !== newStatus) {
                    activeEvent.severity = severity;
                    activeEvent.trafficStatus = newStatus;
                    activeEvent.updatedAt = new Date();

                    if (sensor.sensorType === 'SPEED') activeEvent.averageSpeed = reading.value;
                    if (sensor.sensorType === 'VEHICLE_COUNT') activeEvent.vehicleCount = reading.value;

                    await activeEvent.save();

                    const io = getIO();
                    if (io) io.to(`city:${sensor.cityId}`).emit(WS_EVENTS.TRAFFIC_CONGESTION_UPDATED, activeEvent);
                }
            } else {
                // Create new event
                activeEvent = new TrafficCongestionEvent({
                    cityId: sensor.cityId,
                    roadId: sensor.roadId,
                    intersectionId: sensor.intersectionId,
                    severity,
                    trafficStatus: newStatus,
                    averageSpeed: sensor.sensorType === 'SPEED' ? reading.value : undefined,
                    vehicleCount: sensor.sensorType === 'VEHICLE_COUNT' ? reading.value : undefined,
                    density: sensor.sensorType === 'TRAFFIC_DENSITY' ? reading.value : undefined,
                    queueLength: sensor.sensorType === 'QUEUE_LENGTH' ? reading.value : undefined,
                    startedAt: new Date()
                });
                await activeEvent.save();

                const io = getIO();
                if (io) io.to(`city:${sensor.cityId}`).emit(WS_EVENTS.TRAFFIC_CONGESTION_CREATED, activeEvent);
            }
        } else {
            // Un-congested. Resolve the active open event.
            const query: any = { cityId: sensor.cityId, status: 'ACTIVE' };
            if (sensor.roadId) query.roadId = sensor.roadId;
            else query.intersectionId = sensor.intersectionId;

            const activeEvent = await TrafficCongestionEvent.findOne(query);
            if (activeEvent) {
                activeEvent.status = 'RESOLVED';
                activeEvent.endedAt = new Date();
                await activeEvent.save();

                const io = getIO();
                if (io) io.to(`city:${sensor.cityId}`).emit(WS_EVENTS.TRAFFIC_CONGESTION_UPDATED, activeEvent);
            }
        }
    }

    static async getReadings(cityId: string, sensorId: string, limit: number = 20) {
        return await TrafficSensorReading.find({ cityId, sensorId })
            .sort({ recordedAt: -1 })
            .limit(limit);
    }
}
