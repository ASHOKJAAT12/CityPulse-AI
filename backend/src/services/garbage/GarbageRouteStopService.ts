import { GarbageRouteStop } from '../../models/GarbageRouteStop';
import { GarbageRoute } from '../../models/GarbageRoute';
import { AppError } from '../../utils/AppError';

export interface CreateStopDTO {
    routeId: string;
    cityId: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    sequence: number;
    scheduledArrival?: string;
    scheduledDeparture?: string;
    notes?: string;
}

export interface UpdateStopDTO extends Partial<CreateStopDTO> { }

export class GarbageRouteStopService {
    async addStop(data: CreateStopDTO) {
        const route = await GarbageRoute.findOne({ _id: data.routeId, cityId: data.cityId });
        if (!route) throw AppError.notFound('Route not found or city mismatch');

        // Check sequence collision
        const existingStop = await GarbageRouteStop.findOne({ routeId: data.routeId, sequence: data.sequence });
        if (existingStop) throw AppError.conflict('A stop with this sequence already exists on this route');

        const stop = await GarbageRouteStop.create({
            routeId: data.routeId,
            cityId: data.cityId,
            name: data.name,
            address: data.address,
            location: {
                type: 'Point',
                coordinates: [data.longitude, data.latitude]
            },
            sequence: data.sequence,
            scheduledArrival: data.scheduledArrival,
            scheduledDeparture: data.scheduledDeparture,
            notes: data.notes
        });

        await this.recalculateRouteGeometry(route.id);
        return stop;
    }

    async getStops(routeId: string) {
        return GarbageRouteStop.find({ routeId, active: true }).sort({ sequence: 1 });
    }

    async updateStop(routeId: string, stopId: string, data: UpdateStopDTO) {
        const stop = await GarbageRouteStop.findOne({ _id: stopId, routeId });
        if (!stop) throw AppError.notFound('Stop not found');

        if (data.sequence && data.sequence !== stop.sequence) {
            const existingStop = await GarbageRouteStop.findOne({ routeId: stop.routeId, sequence: data.sequence });
            if (existingStop) {
                // For a manual update, we'd normally shift sequences. To keep it safe, we just reject duplicates here.
                // A UI reorder function will send a bulk update.
                throw AppError.conflict('Sequence conflict. Please reorder properly.');
            }
        }

        const updatePayload: any = { ...data };
        if (data.longitude !== undefined && data.latitude !== undefined) {
            updatePayload.location = {
                type: 'Point',
                coordinates: [data.longitude, data.latitude]
            };
        } else if (data.longitude !== undefined) {
            updatePayload['location.coordinates.0'] = data.longitude;
        } else if (data.latitude !== undefined) {
            updatePayload['location.coordinates.1'] = data.latitude;
        }

        Object.assign(stop, updatePayload);
        await stop.save();

        if (data.longitude !== undefined || data.latitude !== undefined) {
            await this.recalculateRouteGeometry(routeId);
        }

        return stop;
    }

    async removeStop(routeId: string, stopId: string) {
        const stop = await GarbageRouteStop.findOneAndDelete({ _id: stopId, routeId: routeId });
        if (!stop) throw AppError.notFound('Stop not found');

        await this.recalculateRouteGeometry(routeId);
        return stop;
    }

    async reorderStops(routeId: string, stopOrders: { stopId: string, sequence: number }[]) {
        // Simple manual transaction using Promise.all mapping
        const updates = stopOrders.map(async (order) => {
            return GarbageRouteStop.updateOne(
                { _id: order.stopId, routeId },
                { $set: { sequence: order.sequence } }
            );
        });

        await Promise.all(updates);
        return true;
    }

    private async recalculateRouteGeometry(routeId: string) {
        const stops = await GarbageRouteStop.find({ routeId, active: true }).sort({ sequence: 1 });
        const route = await GarbageRoute.findById(routeId);

        if (route && stops.length > 0) {
            const coordinates = stops.map(stop => stop.location.coordinates);
            route.routeGeometry = {
                type: 'LineString',
                coordinates: coordinates
            };
            await route.save();
        } else if (route && stops.length === 0) {
            route.routeGeometry = undefined;
            await route.save();
        }
    }
}

export const garbageRouteStopService = new GarbageRouteStopService();
