/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { cityService } from '../services/city/CityService';

export async function createCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const city = await cityService.createCity(req.body);
        sendSuccess(res, city, 'City created successfully', 201);
    } catch (e) {
        next(e);
    }
}

export async function getCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cities = await cityService.getCities();
        sendSuccess(res, cities, 'Cities retrieved successfully', 200);
    } catch (e) {
        next(e);
    }
}

export async function getActiveCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cities = await cityService.getCities({ status: 'ACTIVE' });
        // Map to safe fields for public viewing
        const safeCities = cities.map(c => ({
            id: c._id.toString(),
            name: c.name,
            state: c.state,
            country: c.country,
            latitude: c.latitude,
            longitude: c.longitude,
            timezone: c.timezone
        }));
        sendSuccess(res, safeCities, 'Active cities retrieved successfully', 200);
    } catch (e) {
        next(e);
    }
}

export async function getCityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const city = await cityService.getCityById(req.params.id);
        const safeCity = {
            id: city._id.toString(),
            name: city.name,
            state: city.state,
            country: city.country,
            latitude: city.latitude,
            longitude: city.longitude,
            timezone: city.timezone,
            status: city.status
        };
        sendSuccess(res, safeCity, 'City retrieved successfully', 200);
    } catch (e) {
        next(e);
    }
}

export async function updateCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const city = await cityService.updateCity(req.params.id, req.body);
        sendSuccess(res, city, 'City updated successfully', 200);
    } catch (e) {
        next(e);
    }
}
