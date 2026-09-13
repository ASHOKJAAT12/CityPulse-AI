import { Request, Response, NextFunction } from 'express';
import { EVStationService } from '../services/ev/EVStationService';
import { EVSessionService } from '../services/ev/EVSessionService';
import { AppError } from '../utils/AppError';

export class EVController {
    static async getStations(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId;
            if (!cityId) throw AppError.badRequest('City ID is required');

            const stations = await EVStationService.getStations(cityId);
            res.json({ success: true, data: stations });
        } catch (err) {
            next(err);
        }
    }

    static async getStationById(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId;
            const station = await EVStationService.getStationById(cityId, req.params.id);
            res.json({ success: true, data: station });
        } catch (err) {
            next(err);
        }
    }

    static async createStation(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.body.cityId || req.user?.cityId;
            const station = await EVStationService.createStation(cityId, req.body);
            res.status(201).json({ success: true, data: station });
        } catch (err) {
            next(err);
        }
    }

    static async updateStation(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId || req.body.cityId;
            const station = await EVStationService.updateStation(cityId, req.params.id, req.body);
            res.json({ success: true, data: station });
        } catch (err) {
            next(err);
        }
    }

    static async deleteStation(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId;
            const station = await EVStationService.deleteStation(cityId, req.params.id);
            res.json({ success: true, data: station });
        } catch (err) {
            next(err);
        }
    }

    static async getConnectors(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId;
            const connectors = await EVStationService.getConnectors(cityId, req.params.stationId);
            res.json({ success: true, data: connectors });
        } catch (err) {
            next(err);
        }
    }

    static async addConnector(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId;
            const connector = await EVStationService.addConnector(cityId, req.params.stationId, req.body);
            res.status(201).json({ success: true, data: connector });
        } catch (err) {
            next(err);
        }
    }

    static async updateConnector(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId;
            const connector = await EVStationService.updateConnector(cityId, req.params.stationId, req.params.connectorId, req.body);
            res.json({ success: true, data: connector });
        } catch (err) {
            next(err);
        }
    }

    static async startSession(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.body.cityId;
            const userId = req.body.userId || req.user?.id;
            if (!userId) throw AppError.unauthorized('User identity required to start session');

            const session = await EVSessionService.startSession(cityId, req.body.stationId, req.body.connectorId, userId, req.body);
            res.status(201).json({ success: true, data: session });
        } catch (err) {
            next(err);
        }
    }

    static async stopSession(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.body.cityId || req.params.cityId;
            const session = await EVSessionService.stopSession(cityId, req.params.id, req.body);
            res.json({ success: true, data: session });
        } catch (err) {
            next(err);
        }
    }

    static async ingestReadings(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId || req.body.cityId;
            const reading = await EVStationService.ingestReading(cityId, req.params.stationId, req.body);
            res.status(201).json({ success: true, data: reading });
        } catch (err) {
            next(err);
        }
    }

    static async getNearbyStations(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.user?.cityId || req.params.cityId;
            const stations = await EVStationService.getStations(cityId);
            res.json({ success: true, data: stations });
        } catch (err) {
            next(err);
        }
    }
}
