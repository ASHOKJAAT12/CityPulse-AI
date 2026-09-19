const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const { User, City } = require('./dist/models');

async function testUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
        console.log("Connected to MongoDB.");

        const cityAdmins = await User.find({ role: 'CITY_ADMIN' });
        console.log("Found", cityAdmins.length, "CITY_ADMINs");
        for (const admin of cityAdmins) {
            console.log("Email:", admin.email, "CityId:", admin.cityId);
            if (!admin.cityId) {
                console.log("WARNING: CITY_ADMIN with missing cityId!");
            }
        }
    } catch (err) {
        console.error("Failed:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}
testUsers();
