import { Request, Response } from 'express';
import {
    IoTDevice,
    IoTGateway,
    IoTTelemetryEvent,
    IoTDeviceCredential,
    IoTDeviceIncident
} from '../../models';
import { AppError } from '../../utils/AppError';
import * as crypto from 'crypto';

export class IoTAdminController {

    // ── Device Management ────────────────────────────────────

    static async getDevices(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const limit = Number(req.query.limit) || 50;
        const page = Number(req.query.page) || 1;

        const filters: any = { cityId };
        if (req.query.status) filters.status = req.query.status;
        if (req.query.connectionStatus) filters.connectionStatus = req.query.connectionStatus;
        if (req.query.service) filters.service = req.query.service;

        const devices = await IoTDevice.find(filters)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await IoTDevice.countDocuments(filters);

        res.json({ success: true, data: { devices, total, page, pages: Math.ceil(total / limit) } });
    }

    static async registerDevice(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const { deviceId, deviceName, deviceType, gatewayId, manufacturer } = req.body;

        const exists = await IoTDevice.exists({ deviceId });
        if (exists) throw AppError.badRequest('Device ID already registered across the platform.');

        const device = await IoTDevice.create({
            cityId,
            deviceId,
            deviceName,
            deviceType,
            gatewayId: gatewayId || undefined,
            manufacturer,
            createdBy: req.user?.id
        });

        res.status(201).json({ success: true, data: device });
    }

    static async generateCredentials(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const { id } = req.params;

        const device = await IoTDevice.findOne({ _id: id, cityId });
        if (!device) throw AppError.notFound('Device not found');

        // Generate a 1-time secure API key to hand to the edge hardware
        const rawApiKey = `SC360_${crypto.randomBytes(32).toString('hex')}`;
        const credentialHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

        // Revoke older credentials actively running
        await IoTDeviceCredential.updateMany({ deviceId: device._id, status: 'ACTIVE' }, { $set: { status: 'REVOKED', revokedAt: new Date() } });

        await IoTDeviceCredential.create({
            deviceId: device._id,
            credentialType: 'API_KEY_HASH',
            credentialHash
        });

        // Activation state transfer
        device.status = 'ACTIVE';
        device.activatedAt = new Date();
        await device.save();

        res.json({
            success: true,
            message: "Store this API Key securely on the device. It will never be shown again.",
            data: {
                deviceId: device.deviceId,
                apiKey: rawApiKey
            }
        });
    }

    // ── Gateway Management ───────────────────────────────────

    static async getGateways(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const gateways = await IoTGateway.find({ cityId }).lean();
        res.json({ success: true, data: gateways });
    }

    static async registerGateway(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const { gatewayId, name, gatewayType } = req.body;

        const exists = await IoTGateway.exists({ gatewayId });
        if (exists) throw AppError.badRequest('Gateway ID already registered.');

        const gateway = await IoTGateway.create({
            cityId,
            gatewayId,
            name,
            gatewayType
        });
        res.status(201).json({ success: true, data: gateway });
    }

    // ── Global Fleet Health / Stats ──────────────────────────

    static async getIoTStats(req: Request, res: Response) {
        const cityId = req.user?.cityId;

        const [
            deviceCount,
            onlineCount,
            gatewayCount,
            rejectCount,
            incidentCount
        ] = await Promise.all([
            IoTDevice.countDocuments({ cityId }),
            IoTDevice.countDocuments({ cityId, connectionStatus: 'ONLINE' }),
            IoTGateway.countDocuments({ cityId }),
            IoTTelemetryEvent.countDocuments({ cityId, processingStatus: 'REJECTED' }),
            IoTDeviceIncident.countDocuments({ cityId, status: 'OPEN' })
        ]);

        res.json({
            success: true,
            data: {
                totalDevices: deviceCount,
                onlineDevices: onlineCount,
                offlineDevices: deviceCount - onlineCount,
                gateways: gatewayCount,
                rejectedEvents: rejectCount,
                openIncidents: incidentCount
            }
        });
    }

    // ── Telemetry Monitor ────────────────────────────────────

    static async getTelemetryStream(req: Request, res: Response) {
        const cityId = req.user?.cityId;
        const limit = Number(req.query.limit) || 100;

        const events = await IoTTelemetryEvent.find({ cityId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({ success: true, data: events });
    }
}
