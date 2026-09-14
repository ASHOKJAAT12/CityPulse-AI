import { IoTDevice } from '../../models';
import logger from '../../utils/logger';
import { getIO } from '../../websocket';

export class IoTHealthMonitor {
    private static interval: NodeJS.Timeout;

    static start() {
        logger.info('Starting IoT Health Monitor...');

        const STALE_THRESHOLD_MS = Number(process.env.IOT_STALE_THRESHOLD_SECONDS || 300) * 1000;
        const OFFLINE_THRESHOLD_MS = Number(process.env.IOT_OFFLINE_THRESHOLD_SECONDS || 3600) * 1000;

        // Sweeping every 1 minute
        this.interval = setInterval(async () => {
            try {
                const now = new Date();
                const staleTime = new Date(now.getTime() - STALE_THRESHOLD_MS);
                const offlineTime = new Date(now.getTime() - OFFLINE_THRESHOLD_MS);

                // 1. Mark STALE
                const staleDevices = await IoTDevice.find({
                    connectionStatus: 'ONLINE',
                    lastSeenAt: { $lt: staleTime, $gte: offlineTime }
                });

                if (staleDevices.length > 0) {
                    await IoTDevice.updateMany(
                        { _id: { $in: staleDevices.map(d => d._id) } },
                        { $set: { connectionStatus: 'STALE' } }
                    );

                    // Broadcast realtime
                    const io = getIO();
                    if (io) {
                        for (const d of staleDevices) {
                            io.to(`city:${d.cityId}`).emit('iot:device-status-updated', { deviceId: d._id, status: 'STALE', lastSeenAt: d.lastSeenAt });
                        }
                    }
                }

                // 2. Mark OFFLINE
                const offlineDevices = await IoTDevice.find({
                    connectionStatus: { $in: ['ONLINE', 'STALE'] },
                    lastSeenAt: { $lt: offlineTime }
                });

                if (offlineDevices.length > 0) {
                    await IoTDevice.updateMany(
                        { _id: { $in: offlineDevices.map(d => d._id) } },
                        { $set: { connectionStatus: 'OFFLINE' } }
                    );

                    const io = getIO();
                    if (io) {
                        for (const d of offlineDevices) {
                            io.to(`city:${d.cityId}`).emit('iot:device-status-updated', { deviceId: d._id, status: 'OFFLINE', lastSeenAt: d.lastSeenAt });
                        }
                    }
                }
            } catch (err) {
                logger.error('IoT Health Monitor Encountered Error:', err);
            }
        }, 60000);
    }

    static stop() {
        if (this.interval) clearInterval(this.interval);
    }
}
