import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDatabase } from '../config/database';
import { EVChargingStation, EVConnector, City } from '../models';
import mongoose from 'mongoose';

// OpenChargeMap API Endpoint
const OCM_URL = "https://api.openchargemap.io/v3/poi/";

async function ingestHybridEVData() {
    try {
        const apiKey = process.env.OPENCHARGEMAP_API_KEY;
        if (!apiKey) {
            console.error('❌ Missing OPENCHARGEMAP_API_KEY in .env file.');
            console.error('API Provider requires an authentication token to sync physical station metadata.');
            console.error('Please obtain a free key from https://openchargemap.org/ and configure it.');
            process.exit(1);
        }

        await connectDatabase();
        console.log('🚀 Connected to Database for Hybrid EV Data Ingestion');

        const city = await City.findOne({ status: 'ACTIVE' });
        if (!city) {
            console.error('❌ No City found in database. Exiting Hybrid Ingestion.');
            process.exit(1);
        }

        const cityId = city._id.toString();
        // Assuming Udaipur Coordinates
        const lat = 24.5854;
        const lng = 73.7125;
        const radiusMeters = 8000; // 8km radius

        console.log(`🌍 Querying Real-World EV Stations via OpenChargeMap within ${radiusMeters / 1000}km of City Center...`);

        const url = `${OCM_URL}?output=json&latitude=${lat}&longitude=${lng}&distance=${radiusMeters / 1000}&distanceunit=KM`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SmartCity360',
                'X-API-Key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`OpenChargeMap API responded with status: ${response.status}`);
        }

        const data: any = await response.json();

        if (!data || data.length === 0) {
            console.log('ℹ️ No real-world EV stations found in this region on OpenChargeMap.');
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log(`🔌 Found ${data.length} real EV Stations in the region. Syncing to MongoDB...`);

        let ingestedCount = 0;

        for (const element of data) {
            const elLat = element.AddressInfo?.Latitude;
            const elLon = element.AddressInfo?.Longitude;
            const name = element.AddressInfo?.Title || element.OperatorInfo?.Title || 'Public Charging Station';
            const operator = element.OperatorInfo?.Title || 'Unknown Operator';
            const code = `OCM_EV_${element.ID}`;

            if (!elLat || !elLon) continue;

            const existingStation = await EVChargingStation.findOne({ cityId, stationCode: code });

            if (!existingStation) {
                const station = new EVChargingStation({
                    cityId,
                    name: name,
                    stationCode: code,
                    operator: operator,
                    stationType: 'PUBLIC',
                    status: 'OPERATIONAL',
                    address: element.AddressInfo?.AddressLine1 || 'Mappable Street Location',
                    location: {
                        type: 'Point',
                        coordinates: [elLon, elLat] // GeoJSON [lng, lat]
                    },
                    totalConnectors: element.Connections?.length || 2,
                    availableConnectors: element.Connections?.length || 2
                });

                await station.save();

                // Seed connectors based on OCM payload
                const maxConnectors = element.Connections?.length || 2;
                for (let i = 0; i < maxConnectors; i++) {
                    const connData = element.Connections?.[i];
                    const connector = new EVConnector({
                        cityId,
                        stationId: station._id,
                        connectorCode: `PLUG_${code}_${i + 1}`,
                        connectorType: connData?.ConnectionType?.Title?.substring(0, 5) || 'TYPE_2',
                        powerType: connData?.CurrentType?.Title === "DC" ? 'DC' : 'AC',
                        maxPowerKW: connData?.PowerKW || 22,
                        voltage: connData?.Voltage || 400,
                        current: connData?.Amps || 32,
                        status: 'AVAILABLE',
                        availability: true
                    });
                    await connector.save();
                }

                console.log(`✅ Synced External Station: ${name}`);
                ingestedCount++;
            }
        }

        console.log(`\n🎉 Hybrid API Ingestion Complete! Successfully registered ${ingestedCount} New Real-World Stations.`);
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('💥 Hybrid EV Simulator Crashed:', error);
        process.exit(1);
    }
}

ingestHybridEVData().catch(console.error);
