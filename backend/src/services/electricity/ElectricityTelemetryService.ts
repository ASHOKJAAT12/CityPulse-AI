import { AppError } from '../../utils/AppError';
import { ElectricitySensor, ElectricitySensorReading, ElectricityIncident, ElectricityAsset } from '../../models';
import { emitToCityRoom } from '../../websocket';
import { notificationService, NotificationAudience } from '../notification/NotificationService';
import { intelligenceBus } from '../intelligence/IntelligenceEventEmitter';

export class ElectricityTelemetryService {
    // ─── THRESHOLD ENGINE & SENSOR READINGS ─────────────────────────────────

    static async ingestReading(cityId: string, sensorId: string, data: any) {
        const sensor = await ElectricitySensor.findOne({ _id: sensorId, cityId });
        if (!sensor) throw AppError.notFound('Electricity Sensor not found');

        const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();
        const value = data.value;

        const reading = new ElectricitySensorReading({
            cityId,
            sensorId: sensor._id,
            assetId: sensor.assetId,
            value,
            unit: sensor.unit,
            recordedAt,
            source: data.source || 'API'
        });
        await reading.save();

        intelligenceBus.emit('telemetry:ingested', {
            cityId, service: 'ELECTRICITY', metric: sensor.sensorType,
            sourceType: 'SENSOR', sourceId: sensorId,
            value, recordedAt, unit: sensor.unit
        });

        let newStatus = sensor.status;
        let isIncident = false;
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
        let incidentType = 'OTHER';

        // Deterministic Threshold Engine
        if (sensor.maxThreshold !== undefined && value > sensor.maxThreshold) {
            newStatus = 'FAULT';
            isIncident = true;
            severity = 'CRITICAL';
            if (sensor.sensorType === 'VOLTAGE') incidentType = 'HIGH_VOLTAGE';
            if (sensor.sensorType === 'CURRENT') incidentType = 'HIGH_CURRENT';
            if (sensor.sensorType === 'LOAD') incidentType = 'OVERLOAD';
            if (sensor.sensorType === 'TEMPERATURE') incidentType = 'OVERHEATING';
        } else if (sensor.minThreshold !== undefined && value < sensor.minThreshold) {
            newStatus = 'FAULT';
            isIncident = true;
            severity = 'CRITICAL';
            if (sensor.sensorType === 'VOLTAGE') incidentType = 'LOW_VOLTAGE';
            if (sensor.sensorType === 'POWER' || sensor.sensorType === 'LOAD') incidentType = 'POWER_DROP';
        } else if (sensor.maxThreshold !== undefined && value >= sensor.maxThreshold * 0.9) {
            newStatus = 'WARNING';
        } else if (sensor.minThreshold !== undefined && value <= sensor.minThreshold * 1.1) {
            newStatus = 'WARNING';
        } else {
            newStatus = 'ONLINE';
        }

        sensor.currentValue = value;
        sensor.lastReadingAt = recordedAt;
        const previousStatus = sensor.status;
        sensor.status = newStatus;
        await sensor.save();

        emitToCityRoom(cityId, 'electricity:reading-updated', {
            sensorId: sensor._id,
            value,
            recordedAt,
            unit: sensor.unit
        });

        if (previousStatus !== newStatus) {
            emitToCityRoom(cityId, 'electricity:sensor-status-updated', {
                sensorId: sensor._id,
                status: newStatus
            });
        }

        // Deduplicate Incident Creation (time-based or status-based)
        if (isIncident && severity) {
            const existingIncident = await ElectricityIncident.findOne({
                sensorId: sensor._id,
                status: { $in: ['OPEN', 'IN_PROGRESS'] }
            });

            if (!existingIncident) {
                const incident = new ElectricityIncident({
                    cityId,
                    assetId: sensor.assetId,
                    sensorId: sensor._id,
                    type: incidentType,
                    severity,
                    title: `Sensor Threshold Violation: ${sensor.sensorType}`,
                    description: `Critical sensor reading of ${value}${sensor.unit} exceeded safe limits.`,
                    reportedValue: value,
                    threshold: value > (sensor.maxThreshold || 0) ? sensor.maxThreshold : sensor.minThreshold
                });
                await incident.save();
                emitToCityRoom(cityId, 'electricity:incident-created', incident);

                await notificationService.send({
                    cityId: cityId,
                    audience: NotificationAudience.CITY,
                    category: 'ELECTRICITY',
                    priority: 'CRITICAL',
                    title: incident.title,
                    message: incident.description,
                    referenceType: 'ELECTRICITY_INCIDENT',
                    referenceId: incident._id.toString()
                });

                const asset = await ElectricityAsset.findOneAndUpdate(
                    { _id: sensor.assetId },
                    { $set: { status: 'FAULT' } },
                    { new: true }
                );

                if (asset) {
                    emitToCityRoom(cityId, 'electricity:asset-status-updated', {
                        assetId: sensor.assetId,
                        status: 'FAULT'
                    });
                }
            }
        }

        return reading;
    }

    // ─── INCIDENTS ──────────────────────────────────────────────────────────

    static async getIncidentsByCity(cityId: string, filter: Record<string, unknown> = {}, limit: number = 100, page: number = 1) {
        const query = { cityId, ...filter };
        const skip = (page - 1) * limit;
        return ElectricityIncident.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    }

    static async getIncidentById(cityId: string, id: string) {
        const incident = await ElectricityIncident.findOne({ _id: id, cityId });
        if (!incident) throw AppError.notFound('Electricity Incident not found');
        return incident;
    }

    static async createIncident(cityId: string, userId: string, data: any) {
        const asset = await ElectricityAsset.findOne({ _id: data.assetId, cityId });
        if (!asset) throw AppError.notFound('Electricity Asset not found');

        const incident = new ElectricityIncident({
            ...data,
            cityId,
            createdBy: userId
        });
        await incident.save();

        emitToCityRoom(cityId, 'electricity:incident-created', incident);
        return incident;
    }

    static async updateIncident(cityId: string, id: string, data: any) {
        const incident = await ElectricityIncident.findOne({ _id: id, cityId });
        if (!incident) throw AppError.notFound('Electricity Incident not found');

        const previousStatus = incident.status;
        Object.assign(incident, data);

        if (['RESOLVED', 'FALSE_ALARM'].includes(incident.status as string) && !['RESOLVED', 'FALSE_ALARM'].includes(previousStatus)) {
            incident.resolvedAt = new Date();
        }
        await incident.save();

        emitToCityRoom(cityId, 'electricity:incident-updated', incident);

        if (['RESOLVED', 'FALSE_ALARM'].includes(incident.status as string)) {
            const otherOpen = await ElectricityIncident.countDocuments({
                assetId: incident.assetId,
                status: { $in: ['OPEN', 'IN_PROGRESS'] }
            });
            if (otherOpen === 0) {
                await ElectricityAsset.updateOne({ _id: incident.assetId }, { $set: { status: 'ACTIVE' } });
                emitToCityRoom(cityId, 'electricity:asset-status-updated', {
                    assetId: incident.assetId,
                    status: 'ACTIVE'
                });
            }
        }

        return incident;
    }
}
