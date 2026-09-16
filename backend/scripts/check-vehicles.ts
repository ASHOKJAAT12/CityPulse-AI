import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database';
import { GarbageVehicle } from '../src/models/GarbageVehicle';

async function check() {
    await connectDatabase();
    const vehicles = await GarbageVehicle.find({});
    console.log(`Total Vehicles in entire DB: ${vehicles.length}`);
    for (const v of vehicles) {
        console.log(`- ${v.vehicleNumber} (City: ${v.cityId})`);
    }
    await mongoose.disconnect();
}
check();
