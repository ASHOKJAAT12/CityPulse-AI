import { StreetlightZone } from '../../models';
import { AppError } from '../../utils/AppError';
import { getIO } from '../../websocket';
import { WS_EVENTS } from '../../constants/events';

export class StreetlightZoneService {
    static async getZones(cityId: string) {
        return await StreetlightZone.find({ cityId }).sort({ createdAt: -1 });
    }

    static async getZoneById(cityId: string, id: string) {
        const zone = await StreetlightZone.findOne({ _id: id, cityId });
        if (!zone) throw AppError.notFound('Zone not found');
        return zone;
    }

    static async createZone(cityId: string, userId: string, data: any) {
        const existing = await StreetlightZone.findOne({ cityId, zoneCode: data.zoneCode });
        if (existing) throw AppError.badRequest('Zone Code already exists');

        const zone = new StreetlightZone({
            cityId,
            createdBy: userId,
            ...data
        });
        await zone.save();
        return zone;
    }

    static async updateZone(cityId: string, zoneId: string, data: any) {
        const zone = await StreetlightZone.findOneAndUpdate(
            { _id: zoneId, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!zone) throw AppError.notFound('Zone not found');

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.STREETLIGHT_ZONE_UPDATED, zone);
        }
        return zone;
    }

    static async deactivateZone(cityId: string, zoneId: string) {
        const zone = await StreetlightZone.findOneAndUpdate(
            { _id: zoneId, cityId },
            { status: 'INACTIVE', active: false },
            { new: true }
        );
        if (!zone) throw AppError.notFound('Zone not found');
        return zone;
    }
}
