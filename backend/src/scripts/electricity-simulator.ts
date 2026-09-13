import mongoose from 'mongoose';
import { env } from '../config/env';
import { ElectricitySensor } from '../models/ElectricitySensor';
import { ElectricityTelemetryService } from '../services/electricity/ElectricityTelemetryService';
import logger from '../utils/logger';
import { connectDatabase } from '../config/database';

async function runSimulator() {
    if (!env.ELECTRICITY_SIMULATOR_ENABLED) {
        logger.info('Electricity simulator is disabled. Enable with ELECTRICITY_SIMULATOR_ENABLED=true');
        process.exit(0);
    }

    logger.info('Connecting to Database for Electricity Simulator...');
    await connectDatabase();
    logger.info('Starting Electricity Grid Telemetry Simulator...');

    const intervalSeconds = env.ELECTRICITY_SIMULATOR_INTERVAL_SECONDS || 15;

    setInterval(async () => {
        try {
            const sensors = await ElectricitySensor.find({ active: true, status: 'ONLINE' });
            if (sensors.length === 0) {
                logger.warn('Simulator: No active electricity sensors found.');
                return;
            }

            logger.info(`Simulator: Generating telemetry for ${sensors.length} electrical sensors...`);

            for (const sensor of sensors) {
                // Determine base value based on type
                let base = 0;
                if (sensor.sensorType === 'VOLTAGE') base = 230; // standard voltage
                if (sensor.sensorType === 'CURRENT') base = 15; // ampers
                if (sensor.sensorType === 'TEMPERATURE') base = 35; // celsius
                if (sensor.sensorType === 'LOAD') base = 60; // percentage

                let val = sensor.currentValue || (sensor.minThreshold ? sensor.minThreshold + (base * 0.1) : base);
                const isSpike = Math.random() < 0.15; // 15% chance of anomaly spike

                if (isSpike) {
                    val = val + (Math.random() > 0.5 ? base * 0.4 : -base * 0.4); // Spike up or drop significantly
                } else {
                    val = val + (Math.random() * (base * 0.05) - (base * 0.025)); // Minor variance ±2.5%
                }

                val = Math.max(0, val);

                const readingData = {
                    value: Number(val.toFixed(2)),
                    recordedAt: new Date().toISOString(),
                    source: 'SIMULATOR',
                };

                await ElectricityTelemetryService.ingestReading(sensor.cityId.toString(), sensor._id.toString(), readingData);
                logger.debug(`Grid Simulator: Ingested ${sensor.sensorCode} -> ${val.toFixed(2)} ${sensor.unit}`);
            }
        } catch (error) {
            logger.error('Simulator error running batch:', error);
        }
    }, intervalSeconds * 1000);
}

runSimulator().catch((e) => {
    logger.error('Failed to start electricity simulator:', e);
    process.exit(1);
});
