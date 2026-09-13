import { connectDatabase } from '../config/database';
import { EVChargingStation, EVConnector, City } from '../models';
import { EVStationService } from '../services/ev/EVStationService';
import { EVSessionService } from '../services/ev/EVSessionService';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const SIMULATION_INTERVAL = 4000;

async function seedEVInfrastructure(cityId: string) {
    let station = await EVChargingStation.findOne({ cityId, stationCode: 'EV_HUB_01' });
    if (!station) {
        station = new EVChargingStation({
            cityId,
            name: 'Central Plaza Fast Chargers',
            stationCode: 'EV_HUB_01',
            operator: 'CityPower',
            stationType: 'PUBLIC',
            status: 'OPERATIONAL',
            address: '100 Central Plaza, New York, NY',
            location: {
                type: 'Point',
                coordinates: [-73.985, 40.758] // Times Square area approx
            },
            totalConnectors: 2,
            availableConnectors: 2
        });
        await station.save();
        console.log('⚡ Seeded EV Station: Central Plaza Fast Chargers');
    }

    let connector = await EVConnector.findOne({ cityId, stationId: station._id, connectorCode: 'PLUG_A' });
    if (!connector) {
        connector = new EVConnector({
            cityId,
            stationId: station._id,
            connectorCode: 'PLUG_A',
            connectorType: 'CCS',
            powerType: 'DC',
            maxPowerKW: 150,
            voltage: 800,
            current: 200,
            status: 'AVAILABLE',
            availability: true
        });
        await connector.save();
        console.log('⚡ Seeded EV Connector: CCS (150kW) PLUG_A');
    }

    return { station, connector };
}

async function runSimulator() {
    try {
        await connectDatabase();
        console.log('🚀 Connected to Database for EV Simulation');

        const city = await City.findOne();
        if (!city) {
            console.error('❌ No City found in database. Exiting Simulator.');
            process.exit(1);
        }

        const cityId = city._id.toString();
        const { station, connector } = await seedEVInfrastructure(cityId);

        console.log('🔋 Starting EV Telemetry & Session Engine...');

        let powerValue = 0;
        let activeSessionId: string | null = null;
        let sessionTick = 0;

        // Mock a user
        const dummyUserId = new mongoose.Types.ObjectId().toString();

        setInterval(async () => {
            try {
                // State machine simulation
                const conn = await EVConnector.findById(connector._id);
                if (!conn) return;

                if (conn.status === 'AVAILABLE' && Math.random() > 0.8) {
                    console.log(`\n🚗 Simulated vehicle pulled up to plug ${conn.connectorCode}...`);
                    // Try to start session
                    const session = await EVSessionService.startSession(cityId, station._id.toString(), connector._id.toString(), dummyUserId, {
                        startMeterValue: Math.floor(Math.random() * 100)
                    });
                    activeSessionId = session._id.toString();
                    powerValue = 10; // Ramp up
                    sessionTick = 0;
                    console.log(`🔌 Started Charging Session: ${session._id}`);
                }
                else if (conn.status === 'CHARGING' && activeSessionId) {
                    sessionTick++;
                    powerValue = Math.min(connector.maxPowerKW, powerValue + (Math.random() * 20)); // Ramp

                    // Ingest Telemetry
                    await EVStationService.ingestReading(cityId, station._id.toString(), {
                        connectorId: connector._id.toString(),
                        powerKW: powerValue,
                        energyKWh: powerValue * (4 / 3600), // fake KWh math for a 4s interval
                        voltage: connector.voltage - (Math.random() * 10),
                        current: Math.floor(powerValue * 1000 / connector.voltage),
                        temperature: 30 + (powerValue * 0.2) + (Math.random() * 5),
                        source: 'SIMULATOR'
                    });

                    console.log(`📈 Ingested Telemetry -> Power: ${powerValue.toFixed(1)}kW | Temp: ${(30 + (powerValue * 0.2)).toFixed(1)}°C`);

                    // Stop condition
                    if (sessionTick > 5 && Math.random() > 0.6) {
                        console.log(`\n✅ Vehicle Finished Charging.`);
                        await EVSessionService.stopSession(cityId, activeSessionId, { energyConsumedKWh: 42.5 });
                        activeSessionId = null;
                        powerValue = 0;
                    }
                }
            } catch (err: any) {
                console.error('⚠️ EV Simulator Error:', err.message);
            }
        }, SIMULATION_INTERVAL);

    } catch (error) {
        console.error('💥 Simulator Crashed:', error);
        process.exit(1);
    }
}

runSimulator();
