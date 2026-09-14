import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { IoTDevice, IoTDeviceCredential, IoTGateway } from '../models';
import * as crypto from 'crypto';

export interface IoTAuthRequest extends Request {
    iotDevice?: any;
    iotCityId?: string;
    iotGatewayId?: string;
}

export async function authenticateIoTDevice(req: IoTAuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const apiKey = req.headers['x-device-api-key'] as string;

        if (!apiKey) {
            return next(AppError.unauthorized('IoT authentication required: Missing x-device-api-key header'));
        }

        // Fast hash for API Key comparison
        const credentialHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        const credential = await IoTDeviceCredential.findOne({
            credentialHash,
            status: 'ACTIVE'
        }).populate('deviceId');

        if (!credential || !credential.deviceId) {
            return next(AppError.unauthorized('Invalid or revoked device credential.'));
        }

        const device = credential.deviceId as any;

        if (device.status !== 'ACTIVE' && device.status !== 'REGISTERED') {
            return next(AppError.unauthorized(`Device is currently ${device.status}`));
        }

        // Attach IoT Specifics to the request
        req.iotDevice = device;
        req.iotCityId = device.cityId.toString();
        // If the API allows gateway pass-through, we might extract it from headers or use the bound gateway.
        // If a gateway sends the payload, it should have its own auth, but for simple phase we bind this securely.
        req.iotGatewayId = device.gatewayId ? device.gatewayId.toString() : undefined;

        // Optionally update lastUsedAt asynchronously
        IoTDeviceCredential.updateOne({ _id: credential._id }, { $set: { lastUsedAt: new Date() } }).catch(err => console.error(err));

        next();
    } catch (err) {
        next(err);
    }
}
