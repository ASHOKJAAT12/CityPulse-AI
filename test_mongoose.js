const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const { User, WaterSupplySchedule } = require('./backend/dist/models');

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
        console.log("Connected to MongoDB.");

        const user = await User.findOne({ email: process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@citypulse.com' });
        console.log("User:", user?.email, "Role:", user?.role, "CityId:", user?.cityId);

        // Can we reproduce the Mongoose error?
        const schedule = new WaterSupplySchedule({
            areaName: 'sector 14',
            startTime: '08:15',
            endTime: '10:16',
            dayOfWeek: 0,
            cityId: user?.cityId,
            createdBy: user?._id
        });

        await schedule.save();
        console.log("Successfully saved schedule!", schedule);
    } catch (err) {
        console.error("Failed to save schedule:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}
testCreate();
