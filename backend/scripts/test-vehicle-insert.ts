import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database';
import { garbageVehicleService } from '../src/services/garbage/GarbageVehicleService';
import { City } from '../src/models/City';

async function insertTest() {
    try {
        await connectDatabase();

        const city = await City.findOne({});
        if (!city) throw new Error("No city found");

        const data = {
            cityId: city._id.toString(),
            vehicleNumber: "RJ27GC1021",
            vehicleType: "COMPACTOR" as any,
            status: "AVAILABLE" as any,
            active: true
        };

        const vehicle = await garbageVehicleService.createVehicle(data);
        console.log(`Successfully created vehicle! ID: ${vehicle._id}`);
    } catch (err: any) {
        console.error("Test failed:", err?.message || err);
    } finally {
        await mongoose.disconnect();
    }
}
insertTest();
