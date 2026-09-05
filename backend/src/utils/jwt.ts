/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../constants/roles';

export interface TokenPayload {
    userId: string;
    role: Role;
    cityId?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * Generate a short-lived access token.
 */
export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });
}

/**
 * Generate a long-lived refresh token.
 */
export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });
}

/**
 * Generate both tokens simultaneously.
 */
export function generateAuthTokens(payload: TokenPayload): AuthTokens {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload.userId),
    };
}

/**
 * Verify an access token. Throws if invalid or expired.
 */
export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

/**
 * Verify a refresh token. Throws if invalid or expired.
 */
export function verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
}
