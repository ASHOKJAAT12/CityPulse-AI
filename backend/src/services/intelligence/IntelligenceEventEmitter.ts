import { EventEmitter } from 'events';
import logger from '../../utils/logger';

class IntelligenceEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.on('error', (err) => {
            logger.error('Intelligence Bus Error (Isolated):', err);
        });
    }
}

// Global singleton asynchronous event bus for AI intelligence
export const intelligenceBus = new IntelligenceEventEmitter();
