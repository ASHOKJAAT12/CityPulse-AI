/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { authService } from '../services/auth/AuthService';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, plaintext: password });
        sendSuccess(res, result, 'Login successful', 200);
    } catch (e) {
        next(e);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshTokens(refreshToken);
        sendSuccess(res, result, 'Session refreshed', 200);
    } catch (e) {
        next(e);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (e) {
        // Even if invalid, return successful logout
        sendSuccess(res, null, 'Logged out successfully', 200);
    }
}
