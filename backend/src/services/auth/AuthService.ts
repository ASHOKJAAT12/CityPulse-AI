/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { User, RefreshToken } from '../../models';
import { UserStatus } from '../../constants/roles';
import { AppError } from '../../utils/AppError';
import { comparePassword } from '../../utils/password';
import { generateAuthTokens, verifyRefreshToken, AuthTokens } from '../../utils/jwt';

export interface LoginParams {
    email: string;
    plaintext: string;
}

export class AuthService {
    /**
     * Authenticate an admin user via Email/Password.
     * Returns tokens and the user object for the client.
     */
    async login(params: LoginParams): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
        const user = await User.findOne({ email: params.email.toLowerCase() });

        if (!user) {
            throw AppError.unauthorized('Invalid email or password');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw AppError.unauthorized('Account is inactive. Access denied.');
        }

        const isMatch = await comparePassword(params.plaintext, user.passwordHash);
        if (!isMatch) {
            throw AppError.unauthorized('Invalid email or password');
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        const tokens = generateAuthTokens({
            userId: user.id,
            role: user.role,
            cityId: user.cityId ? user.cityId.toString() : undefined
        });

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Default 7d rotation

        await RefreshToken.create({
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                cityId: user.cityId ? user.cityId.toString() : null
            },
            tokens
        };
    }

    /**
     * Rotate tokens generating a fresh access & refresh bundle.
     */
    async refreshTokens(refreshTokenStr: string): Promise<AuthTokens> {
        try {
            const payload = verifyRefreshToken(refreshTokenStr);
            const tokenRecord = await RefreshToken.findOne({ token: refreshTokenStr, userId: payload.userId });

            if (!tokenRecord || tokenRecord.revokedAt) {
                throw AppError.unauthorized('Session has been revoked or expired');
            }

            const user = await User.findById(payload.userId);
            if (!user || user.status !== UserStatus.ACTIVE) {
                throw AppError.unauthorized('User is no longer active');
            }

            // Revoke Old Token
            await RefreshToken.deleteOne({ _id: tokenRecord._id });

            const newTokens = generateAuthTokens({
                userId: user.id,
                role: user.role,
                cityId: user.cityId ? user.cityId.toString() : undefined
            });

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await RefreshToken.create({
                token: newTokens.refreshToken,
                userId: user.id,
                expiresAt
            });

            return newTokens;
        } catch (e) {
            throw AppError.unauthorized('Invalid or expired refresh token');
        }
    }

    /**
     * Complete Session Logout
     */
    async logout(refreshTokenStr: string): Promise<void> {
        if (!refreshTokenStr) return;
        await RefreshToken.deleteOne({ token: refreshTokenStr });
    }
}

export const authService = new AuthService();
