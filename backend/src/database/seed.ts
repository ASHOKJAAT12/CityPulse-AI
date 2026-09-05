/* eslint-disable no-console */
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Read .env if it exists so env.ts will not exit the process during standalone execution
dotenv.config();

import { env } from '../config/env';
import { City, User } from '../models';
import { Role, UserStatus } from '../constants/roles';

async function main() {
    console.log('🌱 Seeding development data...');

    // Connect to database directly for seed
    await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });

    // ── Seed City ───────────────────────────────────────────────
    const cityName = env.SEED_CITY_NAME;

    const city = await City.findOneAndUpdate(
        { name: cityName },
        {
            name: cityName,
            state: 'Rajasthan',
            country: 'India',
            location: {
                type: 'Point',
                coordinates: [73.7125, 24.5854], // [longitude, latitude]
            },
            timezone: 'Asia/Kolkata',
            description: 'Development seed city — not for production use',
            status: 'ACTIVE',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ City seeded: ${city.name} (${city.id})`);

    // ── Seed Super Admin ────────────────────────────────────────
    const adminEmail = env.SEED_SUPER_ADMIN_EMAIL;
    const adminPassword = env.SEED_SUPER_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.warn('⚠️  SEED_SUPER_ADMIN_EMAIL or PASSWORD not set — skipping super admin seed');
    } else {
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        const admin = await User.findOneAndUpdate(
            { email: adminEmail },
            {
                email: adminEmail,
                passwordHash,
                firstName: 'Super',
                lastName: 'Admin',
                role: Role.SUPER_ADMIN,
                status: UserStatus.ACTIVE,
                cityId: undefined, // No city specific id for super admin
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`✅ Super admin seeded: ${admin.email}`);
    }

    console.log('');
    console.log('🚀 Seed complete! Development data is ready.');
    console.log('');
    console.log('⚠️  These are DEVELOPMENT credentials only. Never use in production.');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => {
        void mongoose.disconnect();
    });
