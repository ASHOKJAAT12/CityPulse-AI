/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { adminService } from '../services/admin/AdminService';

// --- PROFILE ACTIONS (Self) ---
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const profile = await adminService.getProfile(req.user!.id);
        sendSuccess(res, profile, 'Profile retrieved successfully', 200);
    } catch (e) {
        next(e);
    }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const profile = await adminService.updateProfile(req.user!.id, req.body);
        sendSuccess(res, profile, 'Profile updated successfully', 200);
    } catch (e) {
        next(e);
    }
}

// --- CITY ADMIN ACTIONS (Super Admin Only) ---
export async function createCityAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const admin = await adminService.createCityAdmin({
            email: req.body.email,
            plaintext: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            cityId: req.body.cityId,
            role: req.body.role
        });
        sendSuccess(res, admin, 'City Admin created successfully', 201);
    } catch (e) {
        next(e);
    }
}

export async function getCityAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const filter = req.query.cityId ? { cityId: req.query.cityId } : {};
        const admins = await adminService.getCityAdmins(filter);
        sendSuccess(res, admins, 'City Admins retrieved successfully', 200);
    } catch (e) {
        next(e);
    }
}

export async function getCityAdminById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const admin = await adminService.getCityAdminById(req.params.id);
        sendSuccess(res, admin, 'City Admin retrieved successfully', 200);
    } catch (e) {
        next(e);
    }
}

export async function updateCityAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const admin = await adminService.updateCityAdmin(req.params.id, req.body);
        sendSuccess(res, admin, 'City Admin updated successfully', 200);
    } catch (e) {
        next(e);
    }
}

// Phase 3 Map Scaffolding - Enforces scoped fetching of city map primitives
export async function getAdminMapData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.user!;
        const mapData = {
            cityId: user.cityId || 'global-scope',
            layers: [],
            markers: [],
            status: 'Placeholder for Future Map Operations'
        };
        sendSuccess(res, mapData, 'Map data retrieved successfully', 200);
    } catch (e) {
        next(e);
    }
}
