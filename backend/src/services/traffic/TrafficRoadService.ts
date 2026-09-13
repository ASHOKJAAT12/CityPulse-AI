import { TrafficRoad, TrafficIntersection, TrafficSignal } from '../../models';
import { AppError as ApiError } from '../../utils/AppError';

export class TrafficRoadService {
    // --- Roads ---
    static async getRoads(cityId: string, query: any = {}) {
        return await TrafficRoad.find({ cityId, ...query }).sort({ createdAt: -1 });
    }

    static async getRoadById(cityId: string, roadId: string) {
        const road = await TrafficRoad.findOne({ _id: roadId, cityId });
        if (!road) throw ApiError.notFound('Road not found');
        return road;
    }

    static async createRoad(cityId: string, data: any, userId?: string) {
        // Enforce uniqueness
        const existing = await TrafficRoad.findOne({ cityId, roadCode: data.roadCode });
        if (existing) throw ApiError.badRequest('Road code must be unique in the city');

        const road = new TrafficRoad({
            cityId,
            createdBy: userId,
            ...data
        });
        return await road.save();
    }

    static async updateRoad(cityId: string, roadId: string, data: any) {
        const road = await TrafficRoad.findOneAndUpdate(
            { _id: roadId, cityId },
            { $set: data },
            { new: true }
        );
        if (!road) throw ApiError.notFound('Road not found');
        return road;
    }

    static async deleteRoad(cityId: string, roadId: string) {
        // Prevent deletion if intersections use it
        const intersections = await TrafficIntersection.countDocuments({ cityId, roads: roadId });
        if (intersections > 0) throw ApiError.badRequest('Cannot delete road in use by intersections');

        const deleted = await TrafficRoad.findOneAndDelete({ _id: roadId, cityId });
        if (!deleted) throw ApiError.notFound('Road not found');
        return deleted;
    }

    // --- Intersections ---
    static async getIntersections(cityId: string, query: any = {}) {
        return await TrafficIntersection.find({ cityId, ...query })
            .populate('roads', 'name roadCode status')
            .populate('signalId', 'signalCode status mode')
            .sort({ createdAt: -1 });
    }

    static async getIntersectionById(cityId: string, intersectionId: string) {
        const inter = await TrafficIntersection.findOne({ _id: intersectionId, cityId })
            .populate('roads')
            .populate('signalId');
        if (!inter) throw ApiError.notFound('Intersection not found');
        return inter;
    }

    static async createIntersection(cityId: string, data: any) {
        const existing = await TrafficIntersection.findOne({ cityId, intersectionCode: data.intersectionCode });
        if (existing) throw ApiError.badRequest('Intersection code must be unique');

        const inter = new TrafficIntersection({ cityId, ...data });
        return await inter.save();
    }

    static async updateIntersection(cityId: string, intersectionId: string, data: any) {
        const inter = await TrafficIntersection.findOneAndUpdate(
            { _id: intersectionId, cityId },
            { $set: data },
            { new: true }
        ).populate('roads').populate('signalId');
        if (!inter) throw ApiError.notFound('Intersection not found');
        return inter;
    }

    // --- Signals ---
    static async getSignals(cityId: string, query: any = {}) {
        return await TrafficSignal.find({ cityId, ...query }).sort({ createdAt: -1 });
    }

    static async createSignal(cityId: string, data: any) {
        // Validate Intersection existence
        const inter = await TrafficIntersection.findOne({ _id: data.intersectionId, cityId });
        if (!inter) throw ApiError.notFound('Intersection not found for signal mapping');

        const existing = await TrafficSignal.findOne({ cityId, signalCode: data.signalCode });
        if (existing) throw ApiError.badRequest('Signal code must be unique');

        const signal = new TrafficSignal({ cityId, ...data });
        await signal.save();

        // Update intersection to reflect signal
        inter.signalId = signal._id as any;
        await inter.save();

        return signal;
    }

    static async updateSignal(cityId: string, signalId: string, data: any) {
        data.lastUpdatedAt = new Date();
        const signal = await TrafficSignal.findOneAndUpdate(
            { _id: signalId, cityId },
            { $set: data },
            { new: true }
        );
        if (!signal) throw ApiError.notFound('Signal not found');
        return signal;
    }
}
