import { TrafficIncident, TrafficRoadClosure, TrafficRoadwork, TrafficRoad } from '../../models';
import { AppError as ApiError } from '../../utils/AppError';
import { getIO } from '../../websocket';
import { WS_EVENTS } from '../../constants/events';

export class TrafficIncidentService {

    // --- Incidents ---
    static async getIncidents(cityId: string, query: any = {}) {
        return await TrafficIncident.find({ cityId, ...query })
            .populate('roadId')
            .populate('intersectionId')
            .sort({ createdAt: -1 });
    }

    static async createIncident(cityId: string, data: any, reportedBy?: string) {
        const inc = new TrafficIncident({
            cityId,
            reportedBy,
            ...data
        });
        await inc.save();

        // WebSocket
        const io = getIO();
        if (io) io.to(`city:${cityId}`).emit(WS_EVENTS.TRAFFIC_INCIDENT_CREATED, inc);

        return inc;
    }

    static async updateIncident(cityId: string, incidentId: string, data: any) {
        if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
            data.resolvedAt = new Date();
        }

        const inc = await TrafficIncident.findOneAndUpdate(
            { _id: incidentId, cityId },
            { $set: data },
            { new: true }
        );
        if (!inc) throw ApiError.notFound('Incident not found');

        const io = getIO();
        if (io) io.to(`city:${cityId}`).emit(WS_EVENTS.TRAFFIC_INCIDENT_UPDATED, inc);

        return inc;
    }

    // --- Closures ---
    static async getClosures(cityId: string, query: any = {}) {
        return await TrafficRoadClosure.find({ cityId, ...query })
            .populate('roadId')
            .sort({ createdAt: -1 });
    }

    static async createClosure(cityId: string, data: any, createdBy?: string) {
        const closure = new TrafficRoadClosure({
            cityId,
            createdBy,
            ...data
        });
        await closure.save();

        if (closure.status === 'ACTIVE') {
            await TrafficRoad.findByIdAndUpdate(closure.roadId, { status: 'CLOSED' });
        }

        const io = getIO();
        if (io) io.to(`city:${cityId}`).emit(WS_EVENTS.TRAFFIC_ROAD_CLOSURE_UPDATED, closure);

        return closure;
    }

    static async updateClosure(cityId: string, closureId: string, data: any) {
        const closure = await TrafficRoadClosure.findOneAndUpdate(
            { _id: closureId, cityId },
            { $set: data },
            { new: true }
        );
        if (!closure) throw ApiError.notFound('Closure not found');

        if (closure.status === 'COMPLETED' || closure.status === 'CANCELLED') {
            closure.actualEndAt = new Date();
            await closure.save();
            await TrafficRoad.findByIdAndUpdate(closure.roadId, { status: 'OPEN' });
        }

        const io = getIO();
        if (io) io.to(`city:${cityId}`).emit(WS_EVENTS.TRAFFIC_ROAD_CLOSURE_UPDATED, closure);

        return closure;
    }

    // --- Roadworks ---
    static async getRoadworks(cityId: string, query: any = {}) {
        return await TrafficRoadwork.find({ cityId, ...query })
            .populate('roadId')
            .sort({ createdAt: -1 });
    }

    static async createRoadwork(cityId: string, data: any, createdBy?: string) {
        const roadwork = new TrafficRoadwork({
            cityId,
            createdBy,
            ...data
        });
        await roadwork.save();

        if (roadwork.status === 'IN_PROGRESS') {
            await TrafficRoad.findByIdAndUpdate(roadwork.roadId, { status: 'MAINTENANCE' });
        }

        const io = getIO();
        if (io) io.to(`city:${cityId}`).emit(WS_EVENTS.TRAFFIC_ROADWORK_UPDATED, roadwork);

        return roadwork;
    }

    static async updateRoadwork(cityId: string, roadworkId: string, data: any) {
        const rw = await TrafficRoadwork.findOneAndUpdate(
            { _id: roadworkId, cityId },
            { $set: data },
            { new: true }
        );
        if (!rw) throw ApiError.notFound('Roadwork not found');

        if (rw.status === 'COMPLETED' || rw.status === 'CANCELLED') {
            rw.completedAt = new Date();
            await rw.save();
            await TrafficRoad.findByIdAndUpdate(rw.roadId, { status: 'OPEN' });
        } else if (rw.status === 'IN_PROGRESS') {
            await TrafficRoad.findByIdAndUpdate(rw.roadId, { status: 'MAINTENANCE' });
        }

        const io = getIO();
        if (io) io.to(`city:${cityId}`).emit(WS_EVENTS.TRAFFIC_ROADWORK_UPDATED, rw);

        return rw;
    }
}
