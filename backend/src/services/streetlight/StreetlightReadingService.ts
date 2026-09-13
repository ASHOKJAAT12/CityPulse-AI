import { StreetlightSensor, StreetlightSensorReading, StreetlightAsset, StreetlightIncident } from '../../models';
import { AppError } from '../../utils/AppError';
import { getIO } from '../../websocket';
import { WS_EVENTS } from '../../constants/events';
import mongoose from 'mongoose';

export class StreetlightReadingService {
    static async getSensors(cityId: string) {
        return await StreetlightSensor.find({ cityId })
            .populate('assetId', 'name status')
            .sort({ createdAt: -1 });
    }

    static async ingestReading(cityId: string, sensorId: string, data: { value: number; recordedAt?: string; source?: string }) {
        const sensor = await StreetlightSensor.findOne({ _id: sensorId, cityId });
        if (!sensor || !sensor.active) throw AppError.notFound('Sensor not found or inactive');

        const asset = await StreetlightAsset.findById(sensor.assetId);
        if (!asset) throw AppError.notFound('Mismatched Asset architecture');

        const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();

        const reading = new StreetlightSensorReading({
            cityId,
            sensorId: sensor._id,
            assetId: sensor.assetId,
            controllerId: sensor.controllerId,
            value: data.value,
            unit: sensor.unit,
            recordedAt,
            source: data.source || 'SENSOR'
        });

        await reading.save();

        sensor.currentValue = data.value;
        sensor.lastReadingAt = recordedAt;
        await sensor.save();

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.STREETLIGHT_READING_UPDATED, reading);
        }

        // Fire energy abnormality threshold engine
        await this.evaluateAnomalies(sensor, reading, asset);

        return reading;
    }

    private static async evaluateAnomalies(sensor: any, reading: any, asset: any) {
        let isFaulty = false;
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        let incidentType = '';

        if (sensor.maxThreshold && reading.value > sensor.maxThreshold) {
            isFaulty = true;
            severity = 'HIGH';
            if (sensor.sensorType === 'VOLTAGE') incidentType = 'OVER_VOLTAGE';
            else if (sensor.sensorType === 'POWER' || sensor.sensorType === 'ENERGY') incidentType = 'OVERCONSUMPTION';
            else incidentType = 'SENSOR_FAILURE';
        } else if (sensor.minThreshold && reading.value < sensor.minThreshold) {
            isFaulty = true;
            severity = 'LOW';
            if (sensor.sensorType === 'VOLTAGE') incidentType = 'UNDER_VOLTAGE';
            else if (sensor.sensorType === 'POWER' && asset.status === 'ON') incidentType = 'POWER_FAILURE'; // Expected power but got none
            else incidentType = 'SENSOR_FAILURE';
        }

        if (isFaulty && incidentType) {
            // Update sensor status
            sensor.status = 'WARNING';
            await sensor.save();

            // Check if incident already active
            const activeIncident = await StreetlightIncident.findOne({
                cityId: sensor.cityId,
                sensorId: sensor._id,
                status: { $in: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'] }
            });

            if (!activeIncident) {
                const incident = new StreetlightIncident({
                    cityId: sensor.cityId,
                    assetId: asset._id,
                    controllerId: sensor.controllerId,
                    sensorId: sensor._id,
                    type: incidentType,
                    severity,
                    title: `Abnormal ${sensor.sensorType} Threshold Triggered`,
                    description: `Sensor ${sensor.sensorCode} reported reading ${reading.value} ${sensor.unit} which is beyond safe boundaries.`,
                    location: asset.location,
                    status: 'OPEN',
                    createdBy: new mongoose.Types.ObjectId() // System Admin Dummy ID logically
                });
                // Find system super admin
                incident.createdBy = asset.createdBy; // fallback to creator logic for dummy

                await incident.save();

                const io = getIO();
                if (io) io.to(`city:${sensor.cityId}`).emit(WS_EVENTS.STREETLIGHT_INCIDENT_CREATED, incident);
            }
        }
    }
}
