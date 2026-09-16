import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDatabase } from '../config/database';
import { TrafficRoad, TrafficSensor, TrafficIncident, City } from '../models';
import { TrafficSensorService } from '../services/traffic/TrafficSensorService';
import mongoose from 'mongoose';

const SIMULATION_INTERVAL = 3000; // 3 seconds

async function seedTrafficInfrastructure(cityId: string) {
    let road = await TrafficRoad.findOne({ cityId, roadCode: 'UDAIPUR_MAIN' });
    if (!road) {
        road = new TrafficRoad({
            cityId,
            roadCode: 'UDAIPUR_MAIN',
            name: 'City Center Arterial',
            roadType: 'MAIN_ROAD',
            length: 5.5,
            speedLimit: 40,
            lanes: 4,
            trafficStatus: 'HEAVY',
            geometry: {
                type: 'LineString',
                coordinates: [[73.7100, 24.5800], [73.7150, 24.5850], [73.7200, 24.5900]]
            }
        });
        await road.save();
        console.log('🌱 Seeded Road: City Center Arterial');
    }

    let sensor = await TrafficSensor.findOne({ cityId, sensorCode: 'SNSR_UD_01' });
    if (!sensor) {
        sensor = new TrafficSensor({
            cityId,
            sensorCode: 'SNSR_UD_01',
            sensorType: 'TRAFFIC_DENSITY',
            unit: '%',
            roadId: road._id,
            location: {
                type: 'Point',
                coordinates: [73.7150, 24.5850]
            },
            status: 'ONLINE',
            active: true
        });
        await sensor.save();
        console.log('🌱 Seeded Sensor: SNSR_UD_01 on City Center');
    }

    let incident = await TrafficIncident.findOne({ cityId, title: 'Multi-Vehicle Collision' });
    if (!incident) {
        incident = new TrafficIncident({
            cityId,
            roadId: road._id,
            type: 'ACCIDENT',
            severity: 'CRITICAL',
            title: 'Multi-Vehicle Collision',
            description: 'A major collision involving three vehicles has severely impacted the central arterial block. Emergency response dispatched.',
            location: {
                type: 'Point',
                coordinates: [73.7150, 24.5850]
            },
            status: 'OPEN'
        });
        await incident.save();
        console.log('🚨 Seeded Incident: Multi-Vehicle Collision Event');
    }

    return { road, sensor, incident };
}

async function runSimulator() {
    try {
        await connectDatabase();
        console.log('🚀 Connected to Database');

        let city = await City.findOne();
        if (!city) {
            city = new City({
                name: 'New York',
                state: 'NY',
                country: 'USA',
                location: { type: 'Point', coordinates: [-74.006, 40.7128] },
                status: 'ACTIVE'
            });
            await city.save();
            console.log('🏙️ Seeded temporary City for testing');
        }

        const cityId = city._id.toString();
        const { sensor } = await seedTrafficInfrastructure(cityId);

        console.log('🚦 Starting Traffic Simulation Engine...');
        console.log('Press Ctrl+C to stop.');

        let trend = 1;
        let currentValue = 10;

        setInterval(async () => {
            try {
                // Random walk logic for traffic density
                const change = Math.floor(Math.random() * 15) * trend;
                currentValue = Math.max(0, Math.min(100, currentValue + change));

                // Flip trend occasionally to create peaks and valleys
                if (Math.random() > 0.8) {
                    trend = trend * -1;
                }

                await TrafficSensorService.ingestReading(cityId, sensor._id.toString(), {
                    value: currentValue,
                    source: 'SIMULATOR'
                });

                console.log(`📡 Ingested Traffic Reading: Sensor ${sensor.sensorCode} -> Density: ${currentValue}%`);
            } catch (err: any) {
                console.error('⚠️ Error ingesting reading:', err.message);
            }
        }, SIMULATION_INTERVAL);

    } catch (error) {
        console.error('💥 Simulator Crashed:', error);
        process.exit(1);
    }
}

runSimulator().catch(console.error);
