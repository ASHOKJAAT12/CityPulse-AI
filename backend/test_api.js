const axios = require('axios');
require('dotenv').config({ path: './.env' });
const { User } = require('./dist/models');
const { generateAccessToken } = require('./dist/utils/jwt');
const mongoose = require('mongoose');

async function testApi() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME });
        const admin = await User.findOne({ role: 'SUPER_ADMIN' });

        // Generate Token directly using JWT util
        const token = generateAccessToken({ userId: admin.id, role: admin.role, cityId: admin.cityId });

        const payload = {
            areaName: 'sector 14',
            startTime: '08:15',
            endTime: '10:16',
            notes: '',
            dayOfWeek: 0
        };

        console.log("Sending payload:", payload);

        const response = await axios.post('http://localhost:5000/api/v1/water/schedules', payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("SUCCESS:", response.data);
    } catch (err) {
        if (err.response) {
            console.error("HTTP ERROR:", err.response.status, err.response.data);
        } else {
            console.error("NETWORK ERROR:", err.message);
        }
    } finally {
        await mongoose.disconnect();
    }
}
testApi();
