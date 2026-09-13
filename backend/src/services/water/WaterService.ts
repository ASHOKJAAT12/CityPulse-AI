import { AppError } from '../../utils/AppError';
import { intelligenceBus } from '../intelligence/IntelligenceEventEmitter';
import { WaterAsset, WaterSensor, WaterSensorReading, WaterIncident, WaterSupplySchedule } from '../../models';
import { emitToCityRoom } from '../../websocket';
import { notificationService, NotificationAudience } from '../notification/NotificationService';

export class WaterService {
    // ─── ASSETS ─────────────────────────────────────────────────────────────

    static async getAssetsByCity(cityId: string, filter: Record<string, unknown> = {}, limit: number = 100, page: number = 1) {
        const query = { cityId, ...filter };
        const skip = (page - 1) * limit;
        return WaterAsset.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    }

    static async getAssetById(cityId: string, id: string) {
        const asset = await WaterAsset.findOne({ _id: id, cityId });
        if (!asset) throw AppError.notFound('Water Asset not found');
        return asset;
    }

    static async createAsset(cityId: string, userId: string, data: any) {
        const asset = new WaterAsset({
            ...data,
            cityId,
            createdBy: userId
        });
        await asset.save();
        return asset;
    }

    static async updateAsset(cityId: string, id: string, data: any) {
        const asset = await WaterAsset.findOneAndUpdate(
            { _id: id, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!asset) throw AppError.notFound('Water Asset not found');
        return asset;
    }

    static async deleteAsset(cityId: string, id: string) {
        // Can't delete if sensors are attached
        const sensors = await WaterSensor.countDocuments({ assetId: id });
        if (sensors > 0) throw AppError.badRequest('Cannot delete asset with attached sensors');

        await WaterAsset.findOneAndDelete({ _id: id, cityId });
    }

    // ─── SENSORS ────────────────────────────────────────────────────────────

    static async getSensorsByCity(cityId: string, assetId?: string) {
        const query: any = { cityId };
        if (assetId) query.assetId = assetId;
        return WaterSensor.find(query).sort({ createdAt: -1 });
    }

    static async getSensorById(cityId: string, id: string) {
        const sensor = await WaterSensor.findOne({ _id: id, cityId });
        if (!sensor) throw AppError.notFound('Water Sensor not found');
        return sensor;
    }

    static async createSensor(cityId: string, data: any) {
        // Check asset belongs to city
        const asset = await WaterAsset.findOne({ _id: data.assetId, cityId });
        if (!asset) throw AppError.notFound('Water Asset not found');

        const sensor = new WaterSensor({ ...data, cityId });
        await sensor.save();
        return sensor;
    }

    static async updateSensor(cityId: string, id: string, data: any) {
        const sensor = await WaterSensor.findOneAndUpdate(
            { _id: id, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!sensor) throw AppError.notFound('Water Sensor not found');
        return sensor;
    }

    // ─── SENSOR READINGS AND THRESHOLDS ──────────────────────────────────────

    static async ingestReading(cityId: string, sensorId: string, data: any) {
        const sensor = await WaterSensor.findOne({ _id: sensorId, cityId });
        if (!sensor) throw AppError.notFound('Water Sensor not found');

        const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();
        const value = data.value;

        const reading = new WaterSensorReading({
            cityId,
            sensorId: sensor._id,
            assetId: sensor.assetId,
            value,
            unit: sensor.unit,
            recordedAt,
            source: data.source || 'API' // 'API' by default, maybe 'SIMULATOR', 'SENSOR'
        });

        await reading.save();

        intelligenceBus.emit('telemetry:ingested', {
            cityId, service: 'WATER', metric: sensor.sensorType,
            sourceType: 'SENSOR', sourceId: sensorId,
            value, recordedAt, unit: sensor.unit
        });

        // Check thresholds
        let newStatus = sensor.status;
        let isIncident = false;
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;

        if (sensor.maxThreshold !== undefined && value > sensor.maxThreshold) {
            newStatus = 'FAULT';
            isIncident = true;
            severity = 'CRITICAL';
        } else if (sensor.minThreshold !== undefined && value < sensor.minThreshold) {
            newStatus = 'FAULT';
            isIncident = true;
            severity = 'CRITICAL';
        } else if (sensor.maxThreshold !== undefined && value >= sensor.maxThreshold * 0.9) {
            newStatus = 'WARNING';
        } else if (sensor.minThreshold !== undefined && value <= sensor.minThreshold * 1.1) {
            newStatus = 'WARNING';
        } else {
            newStatus = 'ONLINE';
        }

        // Update sensor current values
        sensor.currentValue = value;
        sensor.lastReadingAt = recordedAt;
        const previousStatus = sensor.status;
        sensor.status = newStatus;
        await sensor.save();

        // Emit WS Reading
        emitToCityRoom(cityId, 'water:sensor-reading-updated', {
            sensorId: sensor._id,
            value,
            recordedAt,
            unit: sensor.unit
        });

        if (previousStatus !== newStatus) {
            emitToCityRoom(cityId, 'water:sensor-status-updated', {
                sensorId: sensor._id,
                status: newStatus
            });
        }

        // Create incident if critical
        if (isIncident && severity) {
            // deduplicate? Check if open incident exists
            const existingIncident = await WaterIncident.findOne({
                sensorId: sensor._id,
                status: { $in: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'] }
            });

            if (!existingIncident) {
                const title = `Sensor Threshold Violation: ${sensor.sensorType}`;
                let typeStr: string = 'OTHER';
                if (sensor.sensorType === 'WATER_LEVEL') typeStr = value > (sensor.maxThreshold || 0) ? 'HIGH_WATER_LEVEL' : 'LOW_WATER_LEVEL';
                if (sensor.sensorType === 'PRESSURE') typeStr = value > (sensor.maxThreshold || 0) ? 'HIGH_PRESSURE' : 'LOW_PRESSURE';

                const incident = new WaterIncident({
                    cityId,
                    assetId: sensor.assetId,
                    sensorId: sensor._id,
                    type: typeStr,
                    severity,
                    title,
                    description: `Sensor reading ${value}${sensor.unit} exceeded threshold limits.`,
                    reportedValue: value
                });
                await incident.save();

                emitToCityRoom(cityId, 'water:incident-created', incident);

                await notificationService.send({
                    cityId: cityId,
                    audience: NotificationAudience.CITY,
                    category: 'WATER',
                    priority: 'CRITICAL',
                    title: incident.title,
                    message: incident.description,
                    referenceType: 'WATER_INCIDENT',
                    referenceId: incident._id.toString()
                });

                // update asset status
                await WaterAsset.updateOne(
                    { _id: sensor.assetId },
                    { $set: { status: 'FAULT' } }
                );

                emitToCityRoom(cityId, 'water:asset-status-updated', {
                    assetId: sensor.assetId,
                    status: 'FAULT'
                });
            }
        }

        return reading;
    }

    static async getSensorHistory(cityId: string, sensorId: string, limit: number = 100, startTime?: Date, endTime?: Date) {
        const query: any = { cityId, sensorId };
        if (startTime || endTime) {
            query.recordedAt = {};
            if (startTime) query.recordedAt.$gte = startTime;
            if (endTime) query.recordedAt.$lte = endTime;
        }

        return WaterSensorReading.find(query).sort({ recordedAt: -1 }).limit(limit);
    }

    // ─── INCIDENTS ──────────────────────────────────────────────────────────

    static async getIncidentsByCity(cityId: string, filter: Record<string, unknown> = {}, limit: number = 100, page: number = 1) {
        const query = { cityId, ...filter };
        const skip = (page - 1) * limit;
        return WaterIncident.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    }

    static async getIncidentById(cityId: string, id: string) {
        const incident = await WaterIncident.findOne({ _id: id, cityId });
        if (!incident) throw AppError.notFound('Water Incident not found');
        return incident;
    }

    static async createIncident(cityId: string, userId: string, data: any) {
        // Must belong to an asset in this city
        const asset = await WaterAsset.findOne({ _id: data.assetId, cityId });
        if (!asset) throw AppError.notFound('Water Asset not found');

        const incident = new WaterIncident({
            ...data,
            cityId,
            createdBy: userId
        });
        await incident.save();

        emitToCityRoom(cityId, 'water:incident-created', incident);
        return incident;
    }

    static async updateIncident(cityId: string, id: string, data: any) {
        const incident = await WaterIncident.findOne({ _id: id, cityId });
        if (!incident) throw AppError.notFound('Water Incident not found');

        const previousStatus = incident.status;

        Object.assign(incident, data);
        if (['RESOLVED', 'CLOSED'].includes(incident.status as string) && !['RESOLVED', 'CLOSED'].includes(previousStatus)) {
            incident.resolvedAt = new Date();
        }
        await incident.save();

        emitToCityRoom(cityId, 'water:incident-updated', incident);

        // if resolved, maybe update asset status if no other incidents
        if (incident.status === 'RESOLVED') {
            const otherOpen = await WaterIncident.countDocuments({
                assetId: incident.assetId,
                status: { $in: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'] }
            });
            if (otherOpen === 0) {
                await WaterAsset.updateOne({ _id: incident.assetId }, { $set: { status: 'ACTIVE' } });
                emitToCityRoom(cityId, 'water:asset-status-updated', {
                    assetId: incident.assetId,
                    status: 'ACTIVE'
                });
            }
        }

        return incident;
    }

    // ─── SCHEDULES ──────────────────────────────────────────────────────────

    static async getSchedulesByCity(cityId: string) {
        return WaterSupplySchedule.find({ cityId }).sort({ dayOfWeek: 1, startTime: 1 });
    }

    static async createSchedule(cityId: string, userId: string, data: any) {
        const schedule = new WaterSupplySchedule({
            ...data,
            cityId,
            createdBy: userId
        });
        await schedule.save();

        emitToCityRoom(cityId, 'water:supply-schedule-updated', schedule);

        await notificationService.send({
            cityId: cityId,
            audience: NotificationAudience.CITY,
            category: 'WATER',
            priority: 'INFO',
            title: `Water Supply Schedule Updated`,
            message: `A new or updated water supply schedule has been published for your area.`,
            referenceType: 'WATER_SCHEDULE',
            referenceId: schedule._id.toString()
        });
        return schedule;
    }

    static async updateSchedule(cityId: string, id: string, data: any) {
        const schedule = await WaterSupplySchedule.findOneAndUpdate(
            { _id: id, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!schedule) throw AppError.notFound('Water Supply Schedule not found');

        emitToCityRoom(cityId, 'water:supply-schedule-updated', schedule);
        return schedule;
    }

    static async deleteSchedule(cityId: string, id: string) {
        const schedule = await WaterSupplySchedule.findOneAndDelete({ _id: id, cityId });
        if (!schedule) throw AppError.notFound('Water Supply Schedule not found');
    }
}
