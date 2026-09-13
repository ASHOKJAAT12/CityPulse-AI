import { Request, Response, NextFunction } from 'express';
import { WaterService } from '../services/water/WaterService';
import { createWaterAssetSchema, updateWaterAssetSchema, createWaterSensorSchema, updateWaterSensorSchema, createWaterSensorReadingSchema, createWaterIncidentSchema, updateWaterIncidentSchema, createWaterSupplyScheduleSchema, updateWaterSupplyScheduleSchema } from '../validators/water.validator';

export class WaterController {

    // ─── ASSETS ─────────────────────────────────────────────────────────────

    static async getAssets(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId']; // For citizens it might be param, for admins it is user.cityId or specified URL param
            const limit = parseInt(req.query['limit'] as string) || 100;
            const page = parseInt(req.query['page'] as string) || 1;
            const assets = await WaterService.getAssetsByCity(cityId, {}, limit, page);
            res.status(200).json({ status: 'success', data: assets });
        } catch (error) {
            next(error);
        }
    }

    static async getAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const asset = await WaterService.getAssetById(cityId, req.params['id']);
            res.status(200).json({ status: 'success', data: asset });
        } catch (error) {
            next(error);
        }
    }

    static async createAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createWaterAssetSchema.parse(req.body);
            const asset = await WaterService.createAsset(cityId, req.user!.id, validated);
            res.status(201).json({ status: 'success', data: asset });
        } catch (error) {
            next(error);
        }
    }

    static async updateAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateWaterAssetSchema.parse(req.body);
            const asset = await WaterService.updateAsset(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: asset });
        } catch (error) {
            next(error);
        }
    }

    static async deleteAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            await WaterService.deleteAsset(cityId, req.params['id']);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // ─── SENSORS ────────────────────────────────────────────────────────────

    static async getSensors(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const assetId = req.query['assetId'] as string;
            const sensors = await WaterService.getSensorsByCity(cityId, assetId);
            res.status(200).json({ status: 'success', data: sensors });
        } catch (error) {
            next(error);
        }
    }

    static async getSensor(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const sensor = await WaterService.getSensorById(cityId, req.params['id']);
            res.status(200).json({ status: 'success', data: sensor });
        } catch (error) {
            next(error);
        }
    }

    static async createSensor(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createWaterSensorSchema.parse(req.body);
            const sensor = await WaterService.createSensor(cityId, validated);
            res.status(201).json({ status: 'success', data: sensor });
        } catch (error) {
            next(error);
        }
    }

    static async updateSensor(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateWaterSensorSchema.parse(req.body);
            const sensor = await WaterService.updateSensor(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: sensor });
        } catch (error) {
            next(error);
        }
    }

    // ─── READINGS ───────────────────────────────────────────────────────────

    static async ingestReading(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createWaterSensorReadingSchema.parse(req.body);
            const readingData = {
                ...validated,
                source: req.user ? (req.user.role === 'SUPER_ADMIN' || req.user.role === 'CITY_ADMIN' ? 'ADMIN' : 'API') : 'API'
            };
            const reading = await WaterService.ingestReading(cityId, req.params['id'], readingData);
            res.status(201).json({ status: 'success', data: reading });
        } catch (error) {
            next(error);
        }
    }

    static async getSensorReadings(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 100;
            const startTime = req.query['startTime'] ? new Date(req.query['startTime'] as string) : undefined;
            const endTime = req.query['endTime'] ? new Date(req.query['endTime'] as string) : undefined;

            const readings = await WaterService.getSensorHistory(cityId, req.params['id'], limit, startTime, endTime);
            res.status(200).json({ status: 'success', data: readings });
        } catch (error) {
            next(error);
        }
    }

    // ─── INCIDENTS ──────────────────────────────────────────────────────────

    static async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const limit = parseInt(req.query['limit'] as string) || 100;
            const page = parseInt(req.query['page'] as string) || 1;
            const incidents = await WaterService.getIncidentsByCity(cityId, {}, limit, page);
            res.status(200).json({ status: 'success', data: incidents });
        } catch (error) {
            next(error);
        }
    }

    static async createIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createWaterIncidentSchema.parse(req.body);
            const incident = await WaterService.createIncident(cityId, req.user!.id, validated);
            res.status(201).json({ status: 'success', data: incident });
        } catch (error) {
            next(error);
        }
    }

    static async updateIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateWaterIncidentSchema.parse(req.body);
            const incident = await WaterService.updateIncident(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: incident });
        } catch (error) {
            next(error);
        }
    }

    // ─── SCHEDULES ──────────────────────────────────────────────────────────

    static async getSchedules(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const schedules = await WaterService.getSchedulesByCity(cityId);
            res.status(200).json({ status: 'success', data: schedules });
        } catch (error) {
            next(error);
        }
    }

    static async createSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = createWaterSupplyScheduleSchema.parse(req.body);
            const schedule = await WaterService.createSchedule(cityId, req.user!.id, validated);
            res.status(201).json({ status: 'success', data: schedule });
        } catch (error) {
            next(error);
        }
    }

    static async updateSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            const validated = updateWaterSupplyScheduleSchema.parse(req.body);
            const schedule = await WaterService.updateSchedule(cityId, req.params['id'], validated);
            res.status(200).json({ status: 'success', data: schedule });
        } catch (error) {
            next(error);
        }
    }

    static async deleteSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params['cityId'];
            await WaterService.deleteSchedule(cityId, req.params['id']);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
