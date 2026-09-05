/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { citizenAuthService } from '../services/citizen/CitizenAuthService';
import { env } from '../config/env';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name, email, mobile, cityId, password } = req.body;
        const result = await citizenAuthService.register({ name, email, mobile, cityId, plaintext: password });

        // Setup secure cookie for refresh token
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/v1/auth/citizen/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user info and accessToken
        sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Registration successful', 201);
    } catch (e) {
        next(e);
    }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body;
        const result = await citizenAuthService.login({ email, plaintext: password });

        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/v1/auth/citizen/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken }, 'Login successful', 200);
    } catch (e) {
        next(e);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const refreshTokenCookie = req.cookies?.refreshToken;
        const fallbackToken = req.body?.refreshToken; // just in case architecture requires it
        const tokenToUse = refreshTokenCookie || fallbackToken;

        if (!tokenToUse) {
            res.status(401).json({ success: false, message: 'No refresh token provided' });
            return;
        }

        const result = await citizenAuthService.refreshTokens(tokenToUse);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/v1/auth/citizen/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        sendSuccess(res, { accessToken: result.accessToken }, 'Session refreshed', 200);
    } catch (e) {
        next(e);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const refreshTokenCookie = req.cookies?.refreshToken;
        const fallbackToken = req.body?.refreshToken;
        const tokenToUse = refreshTokenCookie || fallbackToken;

        if (tokenToUse) {
            await citizenAuthService.logout(tokenToUse);
        }

        res.clearCookie('refreshToken', { path: '/api/v1/auth/citizen/refresh' });
        sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (e) {
        res.clearCookie('refreshToken', { path: '/api/v1/auth/citizen/refresh' });
        sendSuccess(res, null, 'Logged out successfully', 200);
    }
}
