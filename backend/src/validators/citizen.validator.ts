import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});

const mobileRegex = /^[0-9]{10}$/; // Basic 10 digit check, can be adapted

export const citizenRegisterSchema = z.object({
    name: z.string().min(2, 'Name is required').transform((n) => n.trim()),
    email: z.string().email('Invalid email address').transform((e) => e.toLowerCase().trim()),
    mobile: z.string().regex(mobileRegex, 'Invalid mobile number'),
    cityId: objectIdSchema,
    password: z.string().min(8, 'Password must be at least 8 characters')
});

export const citizenLoginSchema = z.object({
    email: z.string().email('Invalid email address').transform((e) => e.toLowerCase().trim()),
    password: z.string().min(1, 'Password is required')
});

export const citizenProfileUpdateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').transform((n) => n.trim()).optional(),
    mobile: z.string().regex(mobileRegex, 'Invalid mobile number').optional()
});

export const citizenPasswordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const citizenCityChangeSchema = z.object({
    cityId: objectIdSchema
});
