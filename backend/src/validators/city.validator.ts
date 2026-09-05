import { z } from 'zod';
import { CityStatus } from '../constants/roles';

export const createCitySchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    state: z.string().min(1, 'State is required').trim(),
    country: z.string().min(1, 'Country is required').trim().default('India'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timezone: z.string().min(1, 'Timezone is required').trim().default('Asia/Kolkata'),
    status: z.enum([CityStatus.ACTIVE, CityStatus.INACTIVE]).optional(),
});

export const updateCitySchema = createCitySchema.partial();
