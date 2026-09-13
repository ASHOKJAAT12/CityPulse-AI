import mongoose from 'mongoose';
import { env } from '../config/env';
import { WaterSensor } from '../models/WaterSensor';
import { WaterService } from '../services/water/WaterService';
import logger from '../utils/logger';
import { connectDatabase } from '../config/database';

/**
 * Development Water Sensor Simulator
 * 
 * Automatically sends readings for all ACTIVE water sensors to the internal service layer.
 * Run in development environment to test websockets, incidents, and dashboards.
 */

async function runSimulator() {
    if (!env.WATER_SIMULATOR_ENABLED) {
        logger.info('Water simulator is disabled. Enable with WATER_SIMULATOR_ENABLED=true');
        process.exit(0);
    }

    logger.info('Connecting to Database for Water Simulator...');
    await connectDatabase();
    logger.info('Starting Water Sensor Simulator...');

    const intervalSeconds = env.WATER_SIMULATOR_INTERVAL_SECONDS || 30;

    setInterval(async () => {
        try {
            const sensors = await WaterSensor.find({ active: true });
            if (sensors.length === 0) {
                logger.warn('Simulator: No active water sensors found in database.');
                return;
            }

            logger.info(`Simulator: Generating readings for ${sensors.length} sensors...`);

            for (const sensor of sensors) {
                // Generate a random reading
                // Usually it should hover around a normal value unless we simulate a spike
                const isSpike = Math.random() < 0.1; // 10% chance to generate a spike/drop

                let val = sensor.currentValue || (sensor.minThreshold ? sensor.minThreshold + 10 : 50);

                if (isSpike) {
                    val = val + (Math.random() > 0.5 ? 50 : -50);
                } else {
                    val = val + (Math.random() * 5 - 2.5); // Minor fluctuation
                }

                // Prevent negative values
                val = Math.max(0, val);

                const readingData = {
                    value: Number(val.toFixed(2)),
                    recordedAt: new Date().toISOString(),
                    source: 'SIMULATOR',
                };

                await WaterService.ingestReading(sensor.cityId.toString(), sensor._id.toString(), readingData);
                logger.debug(`Simulator: Ingested ${sensor.sensorCode} -> ${val.toFixed(2)}`);
            }
        } catch (error) {
            logger.error('Simulator error running batch:', error);
        }
    }, intervalSeconds * 1000);
}

runSimulator().catch((e) => {
    logger.error('Failed to start simulator:', e);
    process.exit(1);
});
