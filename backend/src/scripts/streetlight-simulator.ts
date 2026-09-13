import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { StreetlightSensor, City } from '../models';
import { StreetlightReadingService } from '../services/streetlight/StreetlightReadingService';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runSimulator() {
    console.log('🔗 Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ DB Connected');

    const city = await City.findOne({ isActive: true });
    if (!city) {
        console.error('❌ No active city found');
        process.exit(1);
    }

    console.log(`🏙️ Simulating for ${city.name} (${city._id})`);

    const sensors = await StreetlightSensor.find({ cityId: city._id, active: true }).limit(5);
    if (sensors.length === 0) {
        console.log('⚠️ No streetlight sensors found. Run the seeder first or create via API.');
        process.exit(0);
    }

    console.log(`📡 Simulating live telemetry for ${sensors.length} sensors...`);

    setInterval(async () => {
        try {
            const randomSensor = sensors[Math.floor(Math.random() * sensors.length)];
            const baseValue = randomSensor.sensorType === 'VOLTAGE' ? 220 : randomSensor.sensorType === 'POWER' ? 100 : 50;
            const flutter = (Math.random() * 20 - 10);
            const value = parseFloat((baseValue + flutter).toFixed(2));

            await StreetlightReadingService.ingestReading(city._id.toString(), randomSensor._id.toString(), {
                value,
                source: 'SIMULATOR'
            });

            console.log(`[${new Date().toISOString()}] 📤 Emitted: ${randomSensor.sensorCode} -> ${value} ${randomSensor.unit}`);
        } catch (e: any) {
            console.error('Simulator error:', e.message);
        }
    }, 4000);
}

runSimulator();
