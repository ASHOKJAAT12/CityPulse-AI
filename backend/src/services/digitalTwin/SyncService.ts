import { EventEmitter } from 'events';
import logger from '../../utils/logger';
import { DigitalTwinNode } from '../../models';
import { Types } from 'mongoose';
import { emitToCityRoom } from '../../websocket';

class DigitalTwinEventEmitter extends EventEmitter { }
export const dtBus = new DigitalTwinEventEmitter();

export class DigitalTwinSyncService {
    static init() {
        dtBus.on('sync-node', async (payload: {
            cityId: string,
            domain: string,
            entityType: string,
            entityId: string,
            name: string,
            location: { type: string, coordinates: any },
            status: string,
            health?: number,
            metadata?: any
        }) => {
            try {
                const { cityId, domain, entityType, entityId, name, location, status, health = 100, metadata } = payload;

                const node = await DigitalTwinNode.findOneAndUpdate(
                    { cityId: new Types.ObjectId(cityId), entityId: new Types.ObjectId(entityId) },
                    {
                        $set: {
                            domain,
                            entityType,
                            name,
                            location,
                            status,
                            health,
                            metadata,
                            visible: true,
                            updatedAt: new Date()
                        }
                    },
                    { upsert: true, new: true }
                );

                // Broadcast 
                emitToCityRoom(cityId, 'digital-twin:node-updated', { node });
            } catch (err: any) {
                logger.error('DT Sync Error', { error: err.message, payload });
            }
        });

        dtBus.on('remove-node', async (payload: { cityId: string, entityId: string }) => {
            try {
                await DigitalTwinNode.deleteOne({ entityId: new Types.ObjectId(payload.entityId) });
                emitToCityRoom(payload.cityId, 'digital-twin:node-updated', { removed: true, entityId: payload.entityId });
            } catch (err: any) {
                logger.error('DT Remove Error', { error: err.message });
            }
        });

        logger.info('Digital Twin Synchronization Service Initialized');
    }
}
