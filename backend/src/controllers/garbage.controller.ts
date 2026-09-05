/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { driverService } from '../services/garbage/DriverService';
import { garbageVehicleService } from '../services/garbage/GarbageVehicleService';
import { garbageRouteService } from '../services/garbage/GarbageRouteService';
import { garbageRouteStopService } from '../services/garbage/GarbageRouteStopService';
import { Role } from '../constants/roles';

// Helper to determine cityId for the payload
function resolveCityId(req: Request) {
    if (req.user?.role === Role.CITY_ADMIN || req.user?.role === Role.CITIZEN) {
        return req.user.cityId;
    }
    return req.body.cityId || req.query.cityId || req.params.cityId;
}

export async function createDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = { ...req.body, cityId: resolveCityId(req) };
        const driver = await driverService.createDriver(data);
        sendSuccess(res, driver, 'Driver created successfully', 201);
    } catch (e) {
        next(e);
    }
}

export async function getDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cityId = resolveCityId(req);
        const drivers = await driverService.getDrivers({ cityId });
        sendSuccess(res, drivers, 'Drivers retrieved successfully');
    } catch (e) {
        next(e);
    }
}

export async function getDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const driver = await driverService.getDriverById(req.params.id);
        sendSuccess(res, driver, 'Driver retrieved');
    } catch (e) {
        next(e);
    }
}

export async function updateDriver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const driver = await driverService.updateDriver(req.params.id, req.body);
        sendSuccess(res, driver, 'Driver updated');
    } catch (e) {
        next(e);
    }
}

export async function createVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = { ...req.body, cityId: resolveCityId(req) };
        const vehicle = await garbageVehicleService.createVehicle(data);
        sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
    } catch (e) {
        next(e);
    }
}

export async function getVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cityId = resolveCityId(req);
        const vehicles = await garbageVehicleService.getVehicles({ cityId });
        sendSuccess(res, vehicles, 'Vehicles retrieved');
    } catch (e) {
        next(e);
    }
}

export async function getVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const vehicle = await garbageVehicleService.getVehicleById(req.params.id);
        sendSuccess(res, vehicle, 'Vehicle retrieved');
    } catch (e) {
        next(e);
    }
}

export async function updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const vehicle = await garbageVehicleService.updateVehicle(req.params.id, req.body);
        sendSuccess(res, vehicle, 'Vehicle updated');
    } catch (e) {
        next(e);
    }
}

export async function createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = { ...req.body, cityId: resolveCityId(req), createdBy: req.user?.id };
        const route = await garbageRouteService.createRoute(data);
        sendSuccess(res, route, 'Route created successfully', 201);
    } catch (e) {
        next(e);
    }
}

export async function getRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cityId = resolveCityId(req);
        const routes = await garbageRouteService.getRoutes({ cityId });
        sendSuccess(res, routes, 'Routes retrieved');
    } catch (e) {
        next(e);
    }
}

export async function getRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const route = await garbageRouteService.getRouteById(req.params.id);
        sendSuccess(res, route, 'Route retrieved');
    } catch (e) {
        next(e);
    }
}

export async function updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const route = await garbageRouteService.updateRoute(req.params.id, req.body);
        sendSuccess(res, route, 'Route updated');
    } catch (e) {
        next(e);
    }
}

export async function activateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const route = await garbageRouteService.activateRoute(req.params.id);
        sendSuccess(res, route, 'Route activated');
    } catch (e) {
        next(e);
    }
}

export async function deactivateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const route = await garbageRouteService.deactivateRoute(req.params.id);
        sendSuccess(res, route, 'Route deactivated');
    } catch (e) {
        next(e);
    }
}

export async function addStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = { ...req.body, routeId: req.params.id, cityId: resolveCityId(req) };
        const stop = await garbageRouteStopService.addStop(data);
        sendSuccess(res, stop, 'Stop added', 201);
    } catch (e) {
        next(e);
    }
}

export async function getStops(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const stops = await garbageRouteStopService.getStops(req.params.id);
        sendSuccess(res, stops, 'Stops retrieved');
    } catch (e) {
        next(e);
    }
}

export async function updateStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const stop = await garbageRouteStopService.updateStop(req.params.id, req.params.stopId, req.body);
        sendSuccess(res, stop, 'Stop updated');
    } catch (e) {
        next(e);
    }
}

export async function removeStop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        await garbageRouteStopService.removeStop(req.params.id, req.params.stopId);
        sendSuccess(res, null, 'Stop removed');
    } catch (e) {
        next(e);
    }
}
