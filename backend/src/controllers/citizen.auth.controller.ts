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
            secure: false, // MUST be false for local testing without HTTPS
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user info and accessToken
        sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken, refreshToken: result.tokens.refreshToken }, 'Registration successful', 201);
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
            secure: false, // MUST be false for local testing without HTTPS
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken, refreshToken: result.tokens.refreshToken }, 'Login successful', 200);
    } catch (e) {
        next(e);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const fallbackToken = req.body?.refreshToken; // explicitly passed JSON token
        const refreshTokenCookie = req.cookies?.refreshToken; // browser HTTP-only cookie
        const tokenToUse = fallbackToken || refreshTokenCookie;

        if (!tokenToUse) {
            res.status(401).json({ success: false, message: 'No refresh token provided' });
            return;
        }

        const result = await citizenAuthService.refreshTokens(tokenToUse);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: false, // MUST be false for local testing without HTTPS
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        sendSuccess(res, { accessToken: result.accessToken, refreshToken: result.refreshToken }, 'Session refreshed', 200);
    } catch (e) {
        next(e);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const fallbackToken = req.body?.refreshToken;
        const refreshTokenCookie = req.cookies?.refreshToken;
        const tokenToUse = fallbackToken || refreshTokenCookie;

        if (tokenToUse) {
            await citizenAuthService.logout(tokenToUse);
        }

        res.clearCookie('refreshToken', { path: '/' });
        sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (e) {
        res.clearCookie('refreshToken', { path: '/' });
        sendSuccess(res, null, 'Logged out successfully', 200);
    }
}
