import { StreetlightAsset, StreetlightController, StreetlightSensor, StreetlightIncident, StreetlightMaintenance } from '../../models';
import { AppError } from '../../utils/AppError';
import { getIO } from '../../websocket';
import { WS_EVENTS } from '../../constants/events';

export class StreetlightAssetService {
    static async getAssets(cityId: string, query: any = {}) {
        return await StreetlightAsset.find({ cityId, ...query })
            .populate('zoneId', 'name zoneCode')
            .sort({ createdAt: -1 });
    }

    static async getAssetById(cityId: string, id: string) {
        const asset = await StreetlightAsset.findOne({ _id: id, cityId }).populate('zoneId');
        if (!asset) throw AppError.notFound('Streetlight not found');
        return asset;
    }

    static async createAsset(cityId: string, userId: string, data: any) {
        const existing = await StreetlightAsset.findOne({ cityId, assetCode: data.assetCode });
        if (existing) throw AppError.badRequest('Asset Code already mapped to a streetlight');

        const asset = new StreetlightAsset({
            cityId,
            createdBy: userId,
            ...data
        });
        await asset.save();
        return asset;
    }

    static async updateAsset(cityId: string, assetId: string, data: any) {
        const asset = await StreetlightAsset.findOneAndUpdate(
            { _id: assetId, cityId },
            { $set: data },
            { new: true, runValidators: true }
        ).populate('zoneId');

        if (!asset) throw AppError.notFound('Streetlight not found');

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.STREETLIGHT_STATUS_UPDATED, asset);
        }
        return asset;
    }

    static async deleteAsset(cityId: string, assetId: string) {
        const asset = await StreetlightAsset.findOneAndDelete({ _id: assetId, cityId });
        if (!asset) throw AppError.notFound('Asset not found');
        return asset;
    }

    // Manual deterministic override
    static async safeControlOverride(cityId: string, assetId: string, userId: string, data: { requestedState: 'ON' | 'OFF' | 'DIMMED' | 'AUTO', brightnessPercentage?: number }) {
        const asset = await StreetlightAsset.findOne({ _id: assetId, cityId });
        if (!asset) throw AppError.notFound('Asset not found');

        // Rule: Do not allow operation on maintenance
        if (asset.status === 'MAINTENANCE') {
            throw AppError.badRequest('Cannot command a streetlight currently under maintenance lock.');
        }

        const prevStatus = asset.status;
        const newStatus = data.requestedState === 'AUTO' ? (prevStatus === 'UNKNOWN' ? 'OFF' : prevStatus) : data.requestedState;

        asset.status = newStatus as 'ON' | 'OFF' | 'DIMMED';
        if (data.brightnessPercentage !== undefined) {
            asset.metadata = { ...asset.metadata, brightness: data.brightnessPercentage };
        }

        await asset.save();

        const io = getIO();
        if (io) {
            io.to(`city:${cityId}`).emit(WS_EVENTS.STREETLIGHT_STATUS_UPDATED, asset);
            io.to(`city:${cityId}`).emit(WS_EVENTS.STREETLIGHT_CONTROL_UPDATED, {
                assetId: asset._id,
                requestedState: data.requestedState,
                brightness: data.brightnessPercentage,
                requestedBy: userId,
                executedAt: new Date()
            });
        }
        return asset;
    }
}
