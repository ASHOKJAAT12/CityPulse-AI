/**
 * GPS Simulator — DEVELOPMENT ONLY
 *
 * Simulates a garbage vehicle moving along a route's stops by sending
 * HTTP GPS updates to the backend every N seconds.
 *
 * Usage:
 *   npx ts-node -P tsconfig.json src/scripts/gps-simulator.ts \
 *       --vehicleId <id> \
 *       --routeId <id> \
 *       --token <admin-jwt>
 *
 * The script:
 *   1. Fetches the route stops from the API in sequence order.
 *   2. Interpolates lat/lng between consecutive stops.
 *   3. POSTs GPS updates to /api/v1/garbage/tracking/location every INTERVAL_SEC.
 *   4. Exits once all stops are visited.
 *
 * NEVER run this in production.
 */

import 'dotenv/config';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000/api/v1';
const INTERVAL_SEC = parseInt(process.env['GPS_SIM_INTERVAL_SEC'] ?? '3', 10);
const SPEED_KMPH = parseFloat(process.env['GPS_SIM_SPEED_KMPH'] ?? '15');

if (process.env['NODE_ENV'] === 'production') {
    console.error('❌ GPS Simulator must NOT run in production!');
    process.exit(1);
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const get = (flag: string) => {
        const idx = args.indexOf(flag);
        return idx !== -1 ? args[idx + 1] : undefined;
    };

    const vehicleId = get('--vehicleId');
    const routeId = get('--routeId');
    const token = get('--token');

    if (!vehicleId || !routeId || !token) {
        console.error('Usage: ts-node src/scripts/gps-simulator.ts --vehicleId <id> --routeId <id> --token <jwt>');
        process.exit(1);
    }

    console.log('🚛 GPS Simulator starting...');
    console.log(`   Vehicle: ${vehicleId}`);
    console.log(`   Route:   ${routeId}`);
    console.log(`   Speed:   ${SPEED_KMPH} km/h`);
    console.log(`   Interval: ${INTERVAL_SEC}s`);
    console.log('');

    // Fetch route stops
    const stopsRes = await fetch(`${API_URL}/garbage/routes/${routeId}/stops`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const stopsData = await stopsRes.json() as { data: Array<{ location: { coordinates: [number, number] }; name: string; sequence: number }> };

    if (!stopsRes.ok || !stopsData.data?.length) {
        console.error('❌ Failed to fetch route stops or no stops found.');
        process.exit(1);
    }

    const stops = stopsData.data.sort((a, b) => a.sequence - b.sequence);
    console.log(`📍 Fetched ${stops.length} stops.`);
    stops.forEach(s => console.log(`   [${s.sequence}] ${s.name}: ${s.location.coordinates}`));
    console.log('');

    // Start tracking session via API
    const startRes = await fetch(`${API_URL}/garbage/vehicles/${vehicleId}/tracking/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId }),
    });

    if (!startRes.ok) {
        const err = await startRes.json() as { message?: string };
        console.warn(`⚠️  Tracking start response: ${err.message ?? startRes.statusText}`);
        // Continue even if session already active
    } else {
        console.log('✅ Tracking session started.');
    }

    // Walk through stops — interpolate between each pair
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const nextStop = stops[i + 1];
        const [lng, lat] = stop.location.coordinates;

        console.log(`🚛 At stop [${stop.sequence}]: ${stop.name}`);

        // Emit current stop position
        await sendGps(vehicleId, lat, lng, SPEED_KMPH, token);

        if (!nextStop) break;

        // Interpolate toward next stop
        const [nextLng, nextLat] = nextStop.location.coordinates;
        const steps = 5; // interpolate in N steps between stops
        for (let step = 1; step < steps; step++) {
            const t = step / steps;
            const interpLat = lat + (nextLat - lat) * t;
            const interpLng = lng + (nextLng - lng) * t;
            await sleep(INTERVAL_SEC * 1000);
            process.stdout.write(`  ➡ Interpolating [${step}/${steps}]...\r`);
            await sendGps(vehicleId, interpLat, interpLng, SPEED_KMPH, token);
        }

        await sleep(INTERVAL_SEC * 1000);
    }

    console.log('\n\n✅ All stops visited. Stopping tracking session...');

    // Stop tracking
    const stopRes = await fetch(`${API_URL}/garbage/vehicles/${vehicleId}/tracking/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const stopData = await stopRes.json() as { message?: string };
    console.log(`🛑 Tracking stopped: ${stopData.message ?? 'OK'}`);
}

async function sendGps(vehicleId: string, lat: number, lng: number, speed: number, token: string): Promise<void> {
    const heading = Math.random() * 360;
    const res = await fetch(`${API_URL}/garbage/tracking/location`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, latitude: lat, longitude: lng, speed, heading, accuracy: 5 }),
    });

    if (!res.ok) {
        const err = await res.json() as { message?: string };
        console.error(`  ⚠ GPS update failed: ${err.message ?? res.statusText}`);
    } else {
        console.log(`  📡 GPS [${lat.toFixed(5)}, ${lng.toFixed(5)}] ✓`);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch((err: unknown) => {
    console.error('Simulator error:', err instanceof Error ? err.message : err);
    process.exit(1);
});
