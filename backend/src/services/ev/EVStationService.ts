import { EVChargingStation, EVConnector, EVStationReading } from '../../models';
import { AppError } from '../../utils/AppError';
import { WS_EVENTS } from '../../constants/events';
import { getIO } from '../../websocket';
import mongoose from 'mongoose';
import { notificationService, NotificationAudience } from '../notification/NotificationService';
import { intelligenceBus } from '../intelligence/IntelligenceEventEmitter';

export class EVStationService {
    static async getStations(cityId: string) {
        return await EVChargingStation.find({ cityId });
    }

    static async getStationById(cityId: string, stationId: string) {
        const station = await EVChargingStation.findOne({ _id: stationId, cityId });
        if (!station) throw AppError.notFound('Station not found or belongs to another city');
        return station;
    }

    static async createStation(cityId: string, data: any) {
        const stationObj = new EVChargingStation({ ...data, cityId });
        await stationObj.save();
        return stationObj;
    }

    static async updateStation(cityId: string, stationId: string, data: any) {
        const station = await EVChargingStation.findOneAndUpdate(
            { _id: stationId, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!station) throw AppError.notFound('Station not found');

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.EV_STATION_STATUS_UPDATED, { station });
        }

        return station;
    }

    static async deleteStation(cityId: string, stationId: string) {
        const station = await EVChargingStation.findOneAndDelete({ _id: stationId, cityId });
        if (!station) throw AppError.notFound('Station not found');
        return station;
    }

    // CONNECTORS
    static async getConnectors(cityId: string, stationId: string) {
        return await EVConnector.find({ cityId, stationId });
    }

    static async addConnector(cityId: string, stationId: string, data: any) {
        const station = await this.getStationById(cityId, stationId);

        const connector = new EVConnector({ ...data, cityId, stationId });
        await connector.save();

        // Update station stats
        station.totalConnectors += 1;
        if (connector.status === 'AVAILABLE') {
            station.availableConnectors += 1;
            connector.availability = true;
        }
        await station.save();
        await connector.save();

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.EV_CONNECTOR_STATUS_UPDATED, { connector, stationId });
        }

        return connector;
    }

    static async updateConnector(cityId: string, stationId: string, connectorId: string, data: any) {
        const connector = await EVConnector.findOne({ _id: connectorId, stationId, cityId });
        if (!connector) throw AppError.notFound('Connector not found');

        const oldStatus = connector.status;
        const newStatus = data.status || oldStatus;

        Object.assign(connector, data);
        connector.lastUpdatedAt = new Date();

        if (newStatus === 'AVAILABLE') {
            connector.availability = true;
        } else {
            connector.availability = false;
        }
        // Save here quickly to release lock on document
        await connector.save();

        // Calculate actual availability directly from authoritative connectors record to prevent race condition tracking!
        const station = await EVChargingStation.findById(stationId);
        if (station) {
            const availableCount = await EVConnector.countDocuments({ stationId, status: 'AVAILABLE' });
            station.availableConnectors = availableCount;
            if (activeStatus(newStatus)) {
                // simple heuristic for testing
            }
            await station.save();
        }

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.EV_CONNECTOR_STATUS_UPDATED, { connector, stationId, availableConnectors: station?.availableConnectors });
        }

        return connector;
    }

    // REALTIME INGESTION
    static async ingestReading(cityId: string, stationId: string, data: any) {
        const station = await EVChargingStation.findOne({ _id: stationId, cityId });
        if (!station) throw AppError.notFound('Station not found');

        const objIdPayload: any = { ...data, cityId, stationId };
        if (data.connectorId) {
            const c = await EVConnector.findOne({ _id: data.connectorId, stationId, cityId });
            if (!c) throw AppError.notFound('Connector not found');
            objIdPayload.connectorId = c._id;
        }

        const reading = new EVStationReading(objIdPayload);
        await reading.save();

        if (data.temperature !== undefined) {
            intelligenceBus.emit('telemetry:ingested', {
                cityId, service: 'EV', metric: 'TEMPERATURE',
                sourceType: 'STATION', sourceId: stationId,
                value: data.temperature, recordedAt: new Date(), unit: 'C'
            });
        }
        if (data.powerKw !== undefined) {
            intelligenceBus.emit('telemetry:ingested', {
                cityId, service: 'EV', metric: 'POWER',
                sourceType: 'STATION', sourceId: stationId,
                value: data.powerKw, recordedAt: new Date(), unit: 'kW'
            });
        }

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.EV_READING_UPDATED, reading);
        }

        // Extremely simple threshold logic for "overheating"
        if (data.temperature && data.temperature > 85) {
            console.log(`EV Warning: Station ${stationId} is overheating (${data.temperature}C)`);

            await notificationService.send({
                cityId: cityId,
                audience: NotificationAudience.CITY,
                category: 'EV',
                priority: 'CRITICAL',
                title: `EV Station Overheating Warning`,
                message: `Critical temperature (${data.temperature}°C) detected at station. Automatic cooling or shutdown protocols advised.`,
                referenceType: 'EV_STATION',
                referenceId: stationId
            });
        }

        return reading;
    }
}

function activeStatus(status: string) {
    return status === 'AVAILABLE' || status === 'CHARGING';
}
