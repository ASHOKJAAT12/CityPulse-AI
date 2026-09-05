/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-call */
import { Request, Response, NextFunction } from 'express';
import { User, City } from '../models';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { hashPassword, comparePassword } from '../utils/password';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await User.findById(req.user?.id).select('-passwordHash');
        if (!user) throw AppError.notFound('User not found');

        let city = null;
        if (user.cityId) {
            const cityDoc = await City.findById(user.cityId);
            if (cityDoc) {
                city = { id: cityDoc._id.toString(), name: cityDoc.name, state: cityDoc.state, status: cityDoc.status };
            }
        }

        sendSuccess(res, {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            mobile: user.phone,
            role: user.role,
            status: user.status,
            city,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        }, 'Profile retrieved');
    } catch (e) {
        next(e);
    }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name, mobile } = req.body;
        const user = await User.findById(req.user?.id);
        if (!user) throw AppError.notFound('User not found');

        if (name) {
            const names = name.split(' ');
            user.firstName = names[0];
            user.lastName = names.slice(1).join(' ') || '';
        }
        if (mobile) {
            user.phone = mobile;
        }

        await user.save();
        sendSuccess(res, {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            mobile: user.phone
        }, 'Profile updated');
    } catch (e) {
        next(e);
    }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user?.id);
        if (!user) throw AppError.notFound('User not found');

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) throw AppError.unauthorized('Incorrect current password');

        user.passwordHash = await hashPassword(newPassword);
        await user.save();

        sendSuccess(res, null, 'Password changed successfully');
    } catch (e) {
        next(e);
    }
}

export async function changeCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { cityId } = req.body;
        const user = await User.findById(req.user?.id);
        if (!user) throw AppError.notFound('User not found');

        const city = await City.findById(cityId);
        if (!city || city.status !== 'ACTIVE') {
            throw AppError.badRequest('Selected city is not available or does not exist');
        }

        user.cityId = city._id;
        await user.save();

        sendSuccess(res, {
            city: { id: city._id.toString(), name: city.name, state: city.state, status: city.status }
        }, 'City updated successfully');
    } catch (e) {
        next(e);
    }
}
