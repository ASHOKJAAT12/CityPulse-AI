import { Request, Response, NextFunction } from 'express';
import { TrafficRoadService } from '../services/traffic/TrafficRoadService';
import { TrafficSensorService } from '../services/traffic/TrafficSensorService';
import { TrafficIncidentService } from '../services/traffic/TrafficIncidentService';
import { sendSuccess } from '../utils/response';

export class TrafficController {
    // --- Roads ---
    static async getRoads(req: Request, res: Response, next: NextFunction) {
        try {
            const roads = await TrafficRoadService.getRoads(req.params.cityId);
            sendSuccess(res, roads);
        } catch (error) { next(error); }
    }

    static async getRoadById(req: Request, res: Response, next: NextFunction) {
        try {
            const road = await TrafficRoadService.getRoadById(req.params.cityId, req.params.roadId);
            sendSuccess(res, road);
        } catch (error) { next(error); }
    }

    static async createRoad(req: Request, res: Response, next: NextFunction) {
        try {
            const road = await TrafficRoadService.createRoad(req.params.cityId, req.body, req.user?.id);
            sendSuccess(res, road, 'Road created successfully', 201);
        } catch (error) { next(error); }
    }

    static async updateRoad(req: Request, res: Response, next: NextFunction) {
        try {
            const road = await TrafficRoadService.updateRoad(req.params.cityId, req.params.roadId, req.body);
            sendSuccess(res, road, 'Road updated successfully');
        } catch (error) { next(error); }
    }

    // --- Intersections ---
    static async getIntersections(req: Request, res: Response, next: NextFunction) {
        try {
            const intersections = await TrafficRoadService.getIntersections(req.params.cityId);
            sendSuccess(res, intersections);
        } catch (error) { next(error); }
    }

    static async createIntersection(req: Request, res: Response, next: NextFunction) {
        try {
            const inter = await TrafficRoadService.createIntersection(req.params.cityId, req.body);
            sendSuccess(res, inter, 'Intersection created successfully', 201);
        } catch (error) { next(error); }
    }

    static async updateIntersection(req: Request, res: Response, next: NextFunction) {
        try {
            const inter = await TrafficRoadService.updateIntersection(req.params.cityId, req.params.intersectionId, req.body);
            sendSuccess(res, inter, 'Intersection updated successfully');
        } catch (error) { next(error); }
    }

    // --- Signals ---
    static async getSignals(req: Request, res: Response, next: NextFunction) {
        try {
            const signals = await TrafficRoadService.getSignals(req.params.cityId);
            sendSuccess(res, signals);
        } catch (error) { next(error); }
    }

    static async createSignal(req: Request, res: Response, next: NextFunction) {
        try {
            const signal = await TrafficRoadService.createSignal(req.params.cityId, req.body);
            sendSuccess(res, signal, 'Signal created successfully', 201);
        } catch (error) { next(error); }
    }

    static async updateSignal(req: Request, res: Response, next: NextFunction) {
        try {
            const signal = await TrafficRoadService.updateSignal(req.params.cityId, req.params.signalId, req.body);
            sendSuccess(res, signal, 'Signal updated successfully');
        } catch (error) { next(error); }
    }

    // --- Sensors && Analytics ---
    static async getSensors(req: Request, res: Response, next: NextFunction) {
        try {
            const sensors = await TrafficSensorService.getSensors(req.params.cityId);
            sendSuccess(res, sensors);
        } catch (error) { next(error); }
    }

    static async createSensor(req: Request, res: Response, next: NextFunction) {
        try {
            const sensor = await TrafficSensorService.createSensor(req.params.cityId, req.body);
            sendSuccess(res, sensor, 'Sensor created successfully', 201);
        } catch (error) { next(error); }
    }

    static async ingestSensorReading(req: Request, res: Response, next: NextFunction) {
        try {
            const reading = await TrafficSensorService.ingestReading(req.params.cityId, req.params.sensorId, req.body);
            sendSuccess(res, reading, 'Reading ingested successfully');
        } catch (error) { next(error); }
    }

    static async getIncidents(req: Request, res: Response, next: NextFunction) {
        try {
            const incidents = await TrafficIncidentService.getIncidents(req.params.cityId);
            sendSuccess(res, incidents);
        } catch (error) { next(error); }
    }

    static async createIncident(req: Request, res: Response, next: NextFunction) {
        try {
            const incident = await TrafficIncidentService.createIncident(req.params.cityId, req.body, req.user?.id);
            sendSuccess(res, incident, 'Incident created successfully', 201);
        } catch (error) { next(error); }
    }

    // Added generic catchalls...
}
