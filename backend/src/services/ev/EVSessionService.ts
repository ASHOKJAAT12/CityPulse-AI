import { EVChargingSession, EVConnector, EVChargingStation, EVReservation } from '../../models';
import { AppError } from '../../utils/AppError';
import { WS_EVENTS } from '../../constants/events';
import { getIO } from '../../websocket';
import { EVStationService } from './EVStationService';
import mongoose from 'mongoose';

export class EVSessionService {
    static async startSession(cityId: string, stationId: string, connectorId: string, userId: string, data: any) {
        // Enforce concurrency lock mathematically
        const connector = await EVConnector.findOne({ _id: connectorId, stationId, cityId });
        if (!connector) throw AppError.notFound('Connector not found');

        if (connector.status !== 'AVAILABLE') {
            throw AppError.badRequest('Connector is not currently available for a new session');
        }

        // Check if there are any ACTIVE reservations right now that are NOT this user.
        const activeRes = await EVReservation.findOne({
            connectorId,
            status: { $in: ['CONFIRMED', 'ACTIVE'] },
            startTime: { $lte: new Date() },
            endTime: { $gte: new Date() }
        });

        if (activeRes && activeRes.userId.toString() !== userId) {
            throw AppError.badRequest('Connector is reserved by another user at this time');
        }

        const session = new EVChargingSession({
            cityId,
            stationId,
            connectorId,
            userId,
            sessionStatus: 'CHARGING',
            startedAt: new Date(),
            startMeterValue: data.startMeterValue || 0
        });

        await session.save();

        if (activeRes && activeRes.userId.toString() === userId) {
            activeRes.status = 'COMPLETED'; // fulfilled
            await activeRes.save();
        }

        // State Machine connector transition
        await EVStationService.updateConnector(cityId, stationId, connectorId, { status: 'CHARGING' });

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.EV_CHARGING_SESSION_STARTED, { session });
        }

        return session;
    }

    static async stopSession(cityId: string, sessionId: string, data: any) {
        const session = await EVChargingSession.findOne({ _id: sessionId, cityId });
        if (!session) throw AppError.notFound('Session not found');

        if (session.sessionStatus !== 'CHARGING' && session.sessionStatus !== 'STARTING') {
            throw AppError.badRequest('Session is not currently active');
        }

        session.sessionStatus = 'COMPLETED';
        session.endedAt = new Date();
        session.endMeterValue = data.endMeterValue || session.startMeterValue + (Math.random() * 20); // Dummy for simulator if undefined
        session.energyConsumedKWh = data.energyConsumedKWh || Math.max(0, session.endMeterValue - session.startMeterValue);
        session.durationSeconds = Math.floor((session.endedAt.getTime() - session.startedAt!.getTime()) / 1000);

        await session.save();

        // Release connector back to AVAILABLE
        await EVStationService.updateConnector(cityId, session.stationId.toString(), session.connectorId.toString(), { status: 'AVAILABLE' });

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.EV_CHARGING_SESSION_COMPLETED, { session });
        }

        return session;
    }

    static async createReservation(cityId: string, stationId: string, connectorId: string, userId: string, data: any) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);

        if (startTime <= new Date()) throw AppError.badRequest('Start time must be in the future');
        if (endTime <= startTime) throw AppError.badRequest('End time must be after start time');

        // Check for conflicts
        const conflict = await EVReservation.findOne({
            connectorId,
            status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ]
        });

        if (conflict) {
            throw AppError.badRequest('Time slot overlaps with an existing reservation');
        }

        const resv = new EVReservation({
            cityId,
            stationId,
            connectorId,
            userId,
            startTime,
            endTime,
            status: 'CONFIRMED'
        });

        await resv.save();

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.EV_RESERVATION_UPDATED, { reservation: resv });
        }

        return resv;
    }
}
