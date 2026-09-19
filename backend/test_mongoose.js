require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', { dbName: process.env.MONGODB_DB_NAME || 'citypulse' });
    const PowerOutage = mongoose.models.PowerOutage || mongoose.model('PowerOutage', new mongoose.Schema({}, { strict: false }));
    const ElectricityMaintenance = mongoose.models.ElectricityMaintenance || mongoose.model('ElectricityMaintenance', new mongoose.Schema({}, { strict: false }));

    const outages = await PowerOutage.find({});
    console.log("ALL OUTAGES IN DB:");
    console.log(JSON.stringify(outages, null, 2));

    const maintenance = await ElectricityMaintenance.find({});
    console.log("\nALL MAINTENANCE IN DB:");
    console.log(JSON.stringify(maintenance, null, 2));

    process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
