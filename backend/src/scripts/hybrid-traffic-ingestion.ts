import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDatabase } from '../config/database';
import { TrafficIncident, TrafficRoad, City } from '../models';
import mongoose from 'mongoose';

// TomTom Traffic Incident API Endpoint
const TOMTOM_INCIDENT_URL = "https://api.tomtom.com/traffic/services/5/incidentDetails";

async function ingestHybridTrafficData() {
    try {
        const apiKey = process.env.TOMTOM_API_KEY;
        if (!apiKey) {
            console.error('❌ Missing TOMTOM_API_KEY in .env file.');
            console.error('TomTom requires an API Key to pull live regional traffic congestion and accidents.');
            console.error('Please register for a free developer key at https://developer.tomtom.com/.');
            process.exit(1);
        }

        await connectDatabase();
        console.log('🚀 Connected to Database for Hybrid Traffic Data Ingestion');

        const city = await City.findOne({ status: 'ACTIVE' });
        if (!city) {
            console.error('❌ No City found in database.');
            process.exit(1);
        }

        const cityId = city._id.toString();
        // Assuming Udaipur Bounding Box
        const bbox = "24.5000,73.6500,24.6500,73.7500";

        console.log(`🌍 Querying Real-World Traffic Data via TomTom API within bounding box ${bbox}...`);

        const url = `${TOMTOM_INCIDENT_URL}?key=${apiKey}&bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code}}}}&language=en-GB`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`TomTom API responded with status: ${response.status}`);
        }

        const data: any = await response.json();

        if (!data.incidents || data.incidents.length === 0) {
            console.log('ℹ️ No live traffic incidents found in this region at the moment. (TomTom returned an empty list, likely because it is late night!)');
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log(`🚥 Found ${data.incidents.length} real Live Traffic Incidents. Translating mapped schemas to MongoDB...`);

        let ingestedCount = 0;

        for (const inc of data.incidents) {
            const props = inc.properties;
            const geo = inc.geometry;
            const isPoint = geo?.type === "Point";
            const firstEvent = props.events?.[0];

            // Map TomTom categories to SC360 Schema
            let type: any = 'OTHER';
            if (props.iconCategory === 1) type = 'ACCIDENT';
            else if (props.iconCategory === 6) type = 'ROAD_BLOCK';
            else if (props.iconCategory === 9) type = 'CONSTRUCTION';

            let severity: any = 'LOW';
            if (props.magnitudeOfDelay === 3) severity = 'HIGH';
            else if (props.magnitudeOfDelay === 4) severity = 'CRITICAL';
            else if (props.magnitudeOfDelay === 2) severity = 'MEDIUM';

            const title = firstEvent?.description || 'Traffic Congestion';

            if (isPoint) {
                const lng = geo.coordinates?.[0];
                const lat = geo.coordinates?.[1];

                if (!lat || !lng) continue;

                // Sync single incident to generic tracking pool
                const existingIncident = await TrafficIncident.findOne({ cityId, title, "location.coordinates": [lng, lat] });

                if (!existingIncident) {
                    const incident = new TrafficIncident({
                        cityId,
                        type: type,
                        severity: severity,
                        title: title,
                        description: `Live TomTom Sync: ${firstEvent?.description || 'Unknown event impact'}. Delay magnitude: ${props.magnitudeOfDelay}`,
                        location: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        status: 'OPEN'
                    });

                    await incident.save();
                    console.log(`✅ Synced External Incident: [${severity}] ${title}`);
                    ingestedCount++;
                }
            } else if (geo?.type === "LineString") {
                // TomTom maps congested lines which we map directly to TrafficRoad models
                const existingRoad = await TrafficRoad.findOne({ cityId, roadCode: `TT_ROUTE_${props.id || ingestedCount}` });

                if (!existingRoad) {
                    const road = new TrafficRoad({
                        cityId,
                        roadCode: `TT_ROUTE_${props.id || ingestedCount}`,
                        name: title,
                        roadType: 'OTHER',
                        lanes: 2,
                        speedLimit: 40,
                        trafficStatus: severity === 'CRITICAL' ? 'SEVERE' : (severity === 'HIGH' ? 'HEAVY' : 'MODERATE'),
                        geometry: {
                            type: 'LineString',
                            coordinates: geo.coordinates
                        }
                    });
                    await road.save();
                    console.log(`✅ Synced External Congested Route Segment`);
                    ingestedCount++;
                }
            }
        }

        console.log(`\n🎉 Hybrid API Ingestion Complete! Successfully converted ${ingestedCount} New Real-World Traffic Markers.`);
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('💥 Hybrid Traffic Simulator Crashed:', error);
        process.exit(1);
    }
}

ingestHybridTrafficData().catch(console.error);
