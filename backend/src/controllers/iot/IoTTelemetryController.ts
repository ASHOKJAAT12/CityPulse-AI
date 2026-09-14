import { Response } from 'express';
import { IoTAuthRequest } from '../../middleware/iotAuth';
import { AppError } from '../../utils/AppError';
import {
    IoTTelemetryEvent,
    IoTDeviceBinding,
    IoTHeartbeat,
    IoTGateway
} from '../../models';
import { getIO } from '../../websocket';

// Domain Imports
import { WaterSensorReading } from '../../models/WaterSensorReading';
import { ElectricitySensorReading } from '../../models/ElectricitySensorReading';
import { TrafficSensorReading } from '../../models/TrafficSensorReading';
import { StreetlightSensorReading } from '../../models/StreetlightSensorReading';

export class IoTTelemetryController {

    /**
     * POST /api/v1/iot/telemetry
     * Ingestion point for machine-authenticated IoT devices.
     */
    static async ingestTelemetry(req: IoTAuthRequest, res: Response) {
        const device = req.iotDevice;
        const cityId = req.iotCityId;
        const body = req.body;

        // 1. Validate Core Payload
        if (!body.messageId || !body.timestamp || !body.metrics) {
            return res.status(400).json({ success: false, error: 'INVALID_SCHEMA', message: 'messageId, timestamp, and metrics are required.' });
        }

        // Configuration Limits (Size constraint example handled by express.json limit in index already)

        // 2. Clock Drift Detection
        const deviceTime = new Date(body.timestamp);
        if (isNaN(deviceTime.getTime())) {
            return res.status(400).json({ success: false, error: 'INVALID_TIMESTAMP' });
        }

        const now = new Date();
        const driftMs = Math.abs(now.getTime() - deviceTime.getTime());
        const MAX_SKEW_MS = 60 * 60 * 1000; // 1 hour
        let quality = 'GOOD';
        let errorCode = undefined;

        if (driftMs > MAX_SKEW_MS) {
            quality = 'WARNING';
            errorCode = 'CLOCK_DRIFT';
        }

        // 3. Deduplication Check
        const isDuplicate = await IoTTelemetryEvent.exists({ messageId: body.messageId });
        if (isDuplicate) {
            // Idempotent success (Silently ack)
            return res.status(200).json({
                success: true,
                messageId: body.messageId,
                processingStatus: 'DUPLICATE'
            });
        }

        // 4. Update Heartbeat / Connectivity Status
        await IoTHeartbeat.create({
            cityId,
            deviceId: device._id,
            gatewayId: device.gatewayId,
            receivedAt: now,
            deviceTimestamp: deviceTime,
            status: 'ONLINE'
        });

        // 5. Look up Binding for Domain Forwarding
        const binding = await IoTDeviceBinding.findOne({
            deviceId: device._id,
            active: true
        });

        if (!binding) {
            // Save as stranded IoT Telemetry but do not forward
            await IoTTelemetryEvent.create({
                cityId,
                deviceId: device._id,
                gatewayId: device.gatewayId,
                service: 'UNBOUND',
                entityType: 'NONE',
                messageId: body.messageId,
                timestamp: deviceTime,
                receivedAt: now,
                metrics: body.metrics,
                quality,
                source: 'IOT_INGESTION',
                processingStatus: 'PROCESSED'
            });

            return res.json({ success: true, messageId: body.messageId, processingStatus: 'PROCESSED' });
        }

        // 6. Forward normalized data to Domain Model
        let processingStatus = 'PROCESSED';

        try {
            await IoTTelemetryController.forwardToDomain(binding, body.metrics, deviceTime, cityId!);
        } catch (forwardErr: any) {
            processingStatus = 'FAILED';
            errorCode = 'PROCESSING_FAILURE';
            quality = 'INVALID';
            // Log this securely in production
        }

        // 7. Save to Ledger
        const event = await IoTTelemetryEvent.create({
            cityId,
            deviceId: device._id,
            gatewayId: device.gatewayId,
            service: binding.service,
            entityType: binding.entityType,
            entityId: binding.entityId,
            messageId: body.messageId,
            timestamp: deviceTime,
            receivedAt: now,
            metrics: body.metrics,
            quality,
            source: 'IOT_INGESTION',
            processingStatus,
            errorCode
        });

        // Broadcast to Realtime Engine for Admins
        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit('iot:telemetry-processed', event);
            io.to(`city:${cityId}`).emit('iot:device-status-updated', { deviceId: device._id, status: 'ONLINE', lastSeenAt: now });
        }

        // Async update Device & Gateway lastSeen
        device.lastSeenAt = now;
        device.connectionStatus = 'ONLINE';
        await device.save().catch((err: any) => console.error('Device save error', err));

        if (device.gatewayId) {
            await IoTGateway.updateOne({ _id: device.gatewayId }, { $set: { lastSeenAt: now, connectionStatus: 'ONLINE' } }).catch((err: any) => console.error('Gateway save error', err));
        }

        res.json({
            success: true,
            messageId: body.messageId,
            processingStatus
        });
    }

    /**
     * Forwards normalized metrics safely into legacy domain modules without breaking original architecture.
     */
    private static async forwardToDomain(binding: any, metrics: any, timestamp: Date, cityId: string) {
        // Map dynamic bindings cleanly to existing Domain collections
        if (binding.service === 'WATER') {
            const flowRate = metrics.flowRate ?? metrics.flow ?? 0;
            const pressure = metrics.pressure ?? 0;
            await WaterSensorReading.create({
                cityId,
                sensorId: binding.entityId,
                flowRate,
                pressure,
                quality: 'GOOD',
                recordedAt: timestamp
            });
        }
        else if (binding.service === 'ELECTRICITY') {
            await ElectricitySensorReading.create({
                cityId,
                sensorId: binding.entityId,
                voltage: metrics.voltage || 0,
                current: metrics.current || 0,
                power: metrics.power || 0,
                energy: metrics.energy || 0,
                powerFactor: metrics.powerFactor || 1.0,
                timestamp
            });
        }
        else if (binding.service === 'TRAFFIC') {
            await TrafficSensorReading.create({
                cityId,
                sensorId: binding.entityId,
                vehicleCount: metrics.vehicleCount || 0,
                averageSpeed: metrics.averageSpeed || 0,
                occupancyRate: metrics.occupancyRate || 0,
                recordedAt: timestamp
            });
        }
        else if (binding.service === 'STREETLIGHT') {
            await StreetlightSensorReading.create({
                cityId,
                sensorId: binding.entityId,
                voltage: metrics.voltage || 0,
                current: metrics.current || 0,
                power: metrics.power || 0,
                energy: metrics.energy || 0,
                lightLevel: metrics.lightLevel || 0,
                recordedAt: timestamp
            });
        }
        // EV and Garbage flows could be similarly implemented here based on domain schema
    }
}
