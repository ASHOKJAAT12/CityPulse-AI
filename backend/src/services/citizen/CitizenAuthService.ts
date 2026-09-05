/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { User, RefreshToken, City } from '../../models';
import { UserStatus, Role } from '../../constants/roles';
import { AppError } from '../../utils/AppError';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAuthTokens, verifyRefreshToken, AuthTokens } from '../../utils/jwt';

export interface CitizenRegisterParams {
    name: string;
    email: string;
    mobile: string;
    cityId: string;
    plaintext: string;
}

export interface CitizenLoginParams {
    email: string;
    plaintext: string;
}

export class CitizenAuthService {

    async register(params: CitizenRegisterParams): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
        // Validation checks
        const existingEmail = await User.findOne({ email: params.email });
        if (existingEmail) {
            throw AppError.conflict('Email is already registered');
        }

        const existingMobile = await User.findOne({ phone: params.mobile });
        if (existingMobile) {
            throw AppError.conflict('Mobile number is already registered');
        }

        const city = await City.findById(params.cityId);
        if (!city || city.status !== 'ACTIVE') {
            throw AppError.badRequest('Selected city is not available');
        }

        const names = params.name.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || '';

        const passwordHash = await hashPassword(params.plaintext);

        const newUser = await User.create({
            email: params.email,
            firstName,
            lastName,
            phone: params.mobile,
            passwordHash,
            role: Role.CITIZEN,
            status: UserStatus.ACTIVE, // assuming auto-active for simplicity, or PENDING_VERIFICATION if mail is needed. Let's make it active as per Phase 2 scope which says "An inactive citizen must not be allowed to log in ... Active users can."
            cityId: city._id
        });

        // generate tokens
        const tokens = generateAuthTokens({
            userId: newUser.id,
            role: newUser.role,
            cityId: newUser.cityId?.toString()
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({
            token: tokens.refreshToken,
            userId: newUser.id,
            expiresAt
        });

        return {
            user: {
                id: newUser.id,
                name: `${newUser.firstName} ${newUser.lastName}`.trim(),
                email: newUser.email,
                mobile: newUser.phone,
                role: newUser.role,
                cityId: newUser.cityId?.toString()
            },
            tokens
        };
    }

    async login(params: CitizenLoginParams): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
        const user = await User.findOne({ email: params.email.toLowerCase() });

        if (!user || user.role !== Role.CITIZEN) {
            throw AppError.unauthorized('Invalid email or password');
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw AppError.unauthorized('Account is inactive. Access denied.');
        }

        const city = await City.findById(user.cityId);
        if (!city || city.status !== 'ACTIVE') {
            throw AppError.forbidden('Your selected city is currently unavailable or inactive.');
        }

        const isMatch = await comparePassword(params.plaintext, user.passwordHash);
        if (!isMatch) {
            throw AppError.unauthorized('Invalid email or password');
        }

        user.lastLoginAt = new Date();
        await user.save();

        const tokens = generateAuthTokens({
            userId: user.id,
            role: user.role,
            cityId: user.cityId ? user.cityId.toString() : undefined
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt
        });

        return {
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                mobile: user.phone,
                role: user.role,
                cityId: user.cityId ? user.cityId.toString() : null
            },
            tokens
        };
    }

    async refreshTokens(refreshTokenStr: string): Promise<AuthTokens> {
        try {
            const payload = verifyRefreshToken(refreshTokenStr);
            const tokenRecord = await RefreshToken.findOne({ token: refreshTokenStr, userId: payload.userId });

            if (!tokenRecord || tokenRecord.revokedAt) {
                throw AppError.unauthorized('Session has been revoked or expired');
            }

            const user = await User.findById(payload.userId);
            if (!user || user.status !== UserStatus.ACTIVE || user.role !== Role.CITIZEN) {
                throw AppError.unauthorized('User is no longer active or invalid role');
            }

            const city = await City.findById(user.cityId);
            if (!city || city.status !== 'ACTIVE') {
                throw AppError.forbidden('Your selected city is currently unavailable or inactive.');
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
            if (e instanceof AppError) throw e;
            throw AppError.unauthorized('Invalid or expired refresh token');
        }
    }

    async logout(refreshTokenStr: string): Promise<void> {
        if (!refreshTokenStr) return;
        await RefreshToken.deleteOne({ token: refreshTokenStr });
    }
}

export const citizenAuthService = new CitizenAuthService();
