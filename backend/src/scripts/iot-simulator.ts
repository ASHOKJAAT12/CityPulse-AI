/**
 * Secure Development Simulator for IoT Devices
 * Emulates edge hardware HTTP calls using authentic API_KEY headers.
 */
import mongoose from 'mongoose';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

async function runSimulator() {
    console.log('=== IoT TELEMETRY DEV SIMULATOR ===');

    // In a real dev run, you'd fetch known devices and their saved raw tokens.
    // For this demonstration, we'll imagine a device key is provided via env or args.
    const apiKey = process.env.TEST_IOT_API_KEY;
    if (!apiKey) {
        console.error('TEST_IOT_API_KEY is missing. You must generate an API key via the /api/v1/iot/devices/:id/credentials admin endpoint first.');
        process.exit(1);
    }

    console.log('Simulating edge device hardware reporting telemetry every 10 seconds...');

    setInterval(async () => {
        try {
            const payload = {
                messageId: uuidv4(),
                timestamp: new Date().toISOString(),
                metrics: {
                    flowRate: 15.4 + (Math.random() * 2 - 1),
                    pressure: 120 + (Math.random() * 5 - 2.5)
                }
            };

            const res = await axios.post(`${API_URL}/iot/telemetry`, payload, {
                headers: {
                    'x-device-api-key': apiKey
                }
            });

            console.log(`[OK] Server responded: ${res.data.processingStatus} | messageId: ${res.data.messageId}`);
        } catch (err: any) {
            console.error(`[ERROR] Ingestion Failed: ${err.response?.data?.message || err.message}`);
        }
    }, 10000); // 10 seconds
}

runSimulator().catch(err => {
    console.error('Simulator crashed:', err);
    process.exit(1);
});
