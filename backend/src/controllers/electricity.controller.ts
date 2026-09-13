import { Request, Response, NextFunction } from 'express';
import { ElectricityAssetService } from '../services/electricity/ElectricityAssetService';
import { ElectricityTelemetryService } from '../services/electricity/ElectricityTelemetryService';
import { OutageService } from '../services/electricity/OutageService';
import {
    createElectricityAssetSchema, updateElectricityAssetSchema,
    createElectricitySensorSchema, updateElectricitySensorSchema,
    createElectricitySensorReadingSchema,
    createPowerOutageSchema, updatePowerOutageSchema,
    createElectricityIncidentSchema, updateElectricityIncidentSchema,
    createElectricityMaintenanceSchema, updateElectricityMaintenanceSchema
} from '../validators/electricity.validator';

export class ElectricityController {
    // ─── ASSETS ─────────────────────────────────────────────────────────────

    static async getAssets(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 100;
            const page = parseInt(req.query['page'] as string) || 1;
            const assets = await ElectricityAssetService.getAssetsByCity(cityId, {}, limit, page);
            res.status(200).json({ status: 'success', data: assets });
        } catch (error) { next(error); }
    }

    static async getAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const asset = await ElectricityAssetService.getAssetById(cityId, req.params['id']);
            res.status(200).json({ status: 'success', data: asset });
        } catch (error) { next(error); }
    }

    static async createAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createElectricityAssetSchema.parse(req.body);
            const asset = await ElectricityAssetService.createAsset(cityId, req.user!.id, validated);
            res.status(201).json({ status: 'success', data: asset });
        } catch (error) { next(error); }
    }

    static async updateAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateElectricityAssetSchema.parse(req.body);
            const asset = await ElectricityAssetService.updateAsset(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: asset });
        } catch (error) { next(error); }
    }

    static async deleteAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            await ElectricityAssetService.deleteAsset(cityId, req.params['id']);
            res.status(204).send();
        } catch (error) { next(error); }
    }

    // ─── SENSORS ────────────────────────────────────────────────────────────

    static async getSensors(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const assetId = req.query['assetId'] as string;
            const sensors = await ElectricityAssetService.getSensorsByCity(cityId, assetId);
            res.status(200).json({ status: 'success', data: sensors });
        } catch (error) { next(error); }
    }

    static async getSensor(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const sensor = await ElectricityAssetService.getSensorById(cityId, req.params['id']);
            res.status(200).json({ status: 'success', data: sensor });
        } catch (error) { next(error); }
    }

    static async createSensor(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createElectricitySensorSchema.parse(req.body);
            const sensor = await ElectricityAssetService.createSensor(cityId, validated);
            res.status(201).json({ status: 'success', data: sensor });
        } catch (error) { next(error); }
    }

    static async updateSensor(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateElectricitySensorSchema.parse(req.body);
            const sensor = await ElectricityAssetService.updateSensor(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: sensor });
        } catch (error) { next(error); }
    }

    // ─── READINGS ───────────────────────────────────────────────────────────

    static async ingestReading(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createElectricitySensorReadingSchema.parse(req.body);
            const readingData = {
                ...validated,
                source: req.user ? (req.user.role === 'SUPER_ADMIN' || req.user.role === 'CITY_ADMIN' ? 'ADMIN' : 'API') : 'API'
            };
            const reading = await ElectricityTelemetryService.ingestReading(cityId, req.params['id'], readingData);
            res.status(201).json({ status: 'success', data: reading });
        } catch (error) { next(error); }
    }

    static async getSensorReadings(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 100;
            const startTime = req.query['startTime'] ? new Date(req.query['startTime'] as string) : undefined;
            const endTime = req.query['endTime'] ? new Date(req.query['endTime'] as string) : undefined;
            const readings = await ElectricityAssetService.getSensorHistory(cityId, req.params['id'], limit, startTime, endTime);
            res.status(200).json({ status: 'success', data: readings });
        } catch (error) { next(error); }
    }

    // ─── INCIDENTS ──────────────────────────────────────────────────────────

    static async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 100;
            const page = parseInt(req.query['page'] as string) || 1;
            const incidents = await ElectricityTelemetryService.getIncidentsByCity(cityId, {}, limit, page);
            res.status(200).json({ status: 'success', data: incidents });
        } catch (error) { next(error); }
    }

    static async createIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createElectricityIncidentSchema.parse(req.body);
            const incident = await ElectricityTelemetryService.createIncident(cityId, req.user!.id, validated);
            res.status(201).json({ status: 'success', data: incident });
        } catch (error) { next(error); }
    }

    static async updateIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateElectricityIncidentSchema.parse(req.body);
            const incident = await ElectricityTelemetryService.updateIncident(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: incident });
        } catch (error) { next(error); }
    }

    // ─── OUTAGES ────────────────────────────────────────────────────────────

    static async getOutages(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 100;
            const page = parseInt(req.query['page'] as string) || 1;
            const outages = await OutageService.getOutagesByCity(cityId, {}, limit, page);
            res.status(200).json({ status: 'success', data: outages });
        } catch (error) { next(error); }
    }

    static async getOutage(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const outage = await OutageService.getOutageById(cityId, req.params['id']);
            res.status(200).json({ status: 'success', data: outage });
        } catch (error) { next(error); }
    }

    static async createOutage(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createPowerOutageSchema.parse(req.body);
            const outage = await OutageService.createOutage(cityId, req.user!.id, validated);
            res.status(201).json({ status: 'success', data: outage });
        } catch (error) { next(error); }
    }

    static async updateOutage(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updatePowerOutageSchema.parse(req.body);
            const outage = await OutageService.updateOutage(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: outage });
        } catch (error) { next(error); }
    }

    // ─── MAINTENANCE ────────────────────────────────────────────────────────

    static async getMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 100;
            const page = parseInt(req.query['page'] as string) || 1;
            const maintenance = await OutageService.getMaintenanceByCity(cityId, {}, limit, page);
            res.status(200).json({ status: 'success', data: maintenance });
        } catch (error) { next(error); }
    }

    static async createMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createElectricityMaintenanceSchema.parse(req.body);
            const maintenance = await OutageService.createMaintenance(cityId, req.user!.id, validated);
            res.status(201).json({ status: 'success', data: maintenance });
        } catch (error) { next(error); }
    }

    static async updateMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateElectricityMaintenanceSchema.parse(req.body);
            const maintenance = await OutageService.updateMaintenance(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: maintenance });
        } catch (error) { next(error); }
    }
}
