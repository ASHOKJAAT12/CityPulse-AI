import { Request, Response, NextFunction } from 'express';
import { StreetlightAssetService } from '../services/streetlight/StreetlightAssetService';
import { StreetlightZoneService } from '../services/streetlight/StreetlightZoneService';
import { StreetlightReadingService } from '../services/streetlight/StreetlightReadingService';

export class StreetlightController {
    static async getAssets(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId;
            const assets = await StreetlightAssetService.getAssets(cityId, req.query);
            res.status(200).json({ status: 'success', data: assets });
        } catch (e) { next(e); }
    }

    static async getAssetById(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId;
            const asset = await StreetlightAssetService.getAssetById(cityId, req.params.id);
            res.status(200).json({ status: 'success', data: asset });
        } catch (e) { next(e); }
    }

    static async createAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId || req.body.cityId;
            const userId = (req as any).user?.id || req.body.userId;
            const asset = await StreetlightAssetService.createAsset(cityId, userId, req.body);
            res.status(201).json({ status: 'success', data: asset });
        } catch (e) { next(e); }
    }

    static async updateAsset(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId;
            const asset = await StreetlightAssetService.updateAsset(cityId, req.params.id, req.body);
            res.status(200).json({ status: 'success', data: asset });
        } catch (e) { next(e); }
    }

    static async getZones(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId;
            const zones = await StreetlightZoneService.getZones(cityId);
            res.status(200).json({ status: 'success', data: zones });
        } catch (e) { next(e); }
    }

    static async createZone(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId || req.body.cityId;
            const userId = (req as any).user?.id || req.body.userId;
            const zone = await StreetlightZoneService.createZone(cityId, userId, req.body);
            res.status(201).json({ status: 'success', data: zone });
        } catch (e) { next(e); }
    }

    static async getSensors(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId;
            const sensors = await StreetlightReadingService.getSensors(cityId);
            res.status(200).json({ status: 'success', data: sensors });
        } catch (e) { next(e); }
    }

    static async ingestReading(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId;
            const reading = await StreetlightReadingService.ingestReading(cityId, req.params.id, req.body);
            res.status(201).json({ status: 'success', data: reading });
        } catch (e) { next(e); }
    }

    static async overrideStreetlightState(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user?.cityId || req.params.cityId;
            const userId = (req as any).user?.id || req.body.userId;
            const asset = await StreetlightAssetService.safeControlOverride(
                cityId,
                req.params.id,
                userId,
                req.body
            );
            res.status(200).json({ status: 'success', data: asset });
        } catch (e) { next(e); }
    }
}
