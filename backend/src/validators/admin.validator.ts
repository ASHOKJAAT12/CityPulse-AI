import { z } from 'zod';
import { UserStatus, Role } from '../constants/roles';

export const updateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional()
});

export const createCityAdminSchema = z.object({
    email: z.string().email('Invalid email address').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    phone: z.string().optional(),
    cityId: z.string().min(1, 'City ID is required'),
    role: z.literal(Role.CITY_ADMIN).default(Role.CITY_ADMIN)
});

export const updateCityAdminSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED]).optional()
});
