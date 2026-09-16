import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import axios from 'axios';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database';
import { User } from '../src/models/User';

async function mimicFrontend() {
    await connectDatabase();

    // Find the first CITY_ADMIN
    const admin = await User.findOne({ role: 'CITY_ADMIN' });
    if (!admin) {
        console.log("No CITY_ADMIN found!");
        return process.exit(1);
    }

    // Login to get token
    // Actually wait, let's just use axios to login through auth endpoint
    // since passwords might be hashed. We know standard password is often smartcity360.
    console.log(`Trying to login as ${admin.email}`);

    try {
        const loginRes = await axios.post('http://localhost:5000/api/v1/auth/admin/login', {
            email: admin.email,
            password: 'password123' // Try standard fallback
        });

        const token = loginRes.data.data.accessToken;
        console.log("✅ Authenticated!");

        // Emulate Garbage Vehicles form submission
        console.log("🚀 Launching POST /garbage/vehicles");
        const payload = {
            status: "AVAILABLE",
            active: true,
            vehicleType: "COMPACTOR",
            vehicleNumber: "RJ27TEST",
            // Notice: driverId is purposely excluded to mimic UI
        };

        const createRes = await axios.post('http://localhost:5000/api/v1/garbage/vehicles', payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("🎉 SUCCESS!", createRes.data);
    } catch (err: any) {
        console.error("💥 HTTP ERROR:", err.response?.status, err.response?.data || err.message);
    } finally {
        await mongoose.disconnect();
    }
}
mimicFrontend();
