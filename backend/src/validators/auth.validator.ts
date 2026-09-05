import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').transform((e) => e.toLowerCase().trim()),
    password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

export const logoutSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});
