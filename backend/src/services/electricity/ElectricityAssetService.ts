import { AppError } from '../../utils/AppError';
import { ElectricityAsset, ElectricitySensor, ElectricitySensorReading } from '../../models';

export class ElectricityAssetService {
    // ─── ASSETS ─────────────────────────────────────────────────────────────

    static async getAssetsByCity(cityId: string, filter: Record<string, unknown> = {}, limit: number = 100, page: number = 1) {
        const query = { cityId, ...filter };
        const skip = (page - 1) * limit;
        return ElectricityAsset.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    }

    static async getAssetById(cityId: string, id: string) {
        const asset = await ElectricityAsset.findOne({ _id: id, cityId });
        if (!asset) throw AppError.notFound('Electricity Asset not found');
        return asset;
    }

    static async createAsset(cityId: string, userId: string, data: any) {
        const asset = new ElectricityAsset({
            ...data,
            cityId,
            createdBy: userId
        });
        await asset.save();
        return asset;
    }

    static async updateAsset(cityId: string, id: string, data: any) {
        const asset = await ElectricityAsset.findOneAndUpdate(
            { _id: id, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!asset) throw AppError.notFound('Electricity Asset not found');
        return asset;
    }

    static async deleteAsset(cityId: string, id: string) {
        const sensors = await ElectricitySensor.countDocuments({ assetId: id });
        if (sensors > 0) throw AppError.badRequest('Cannot delete asset with attached sensors');

        await ElectricityAsset.findOneAndDelete({ _id: id, cityId });
    }

    // ─── SENSORS ────────────────────────────────────────────────────────────

    static async getSensorsByCity(cityId: string, assetId?: string) {
        const query: any = { cityId };
        if (assetId) query.assetId = assetId;
        return ElectricitySensor.find(query).sort({ createdAt: -1 });
    }

    static async getSensorById(cityId: string, id: string) {
        const sensor = await ElectricitySensor.findOne({ _id: id, cityId });
        if (!sensor) throw AppError.notFound('Electricity Sensor not found');
        return sensor;
    }

    static async createSensor(cityId: string, data: any) {
        const asset = await ElectricityAsset.findOne({ _id: data.assetId, cityId });
        if (!asset) throw AppError.notFound('Electricity Asset not found');

        const sensor = new ElectricitySensor({ ...data, cityId });
        await sensor.save();
        return sensor;
    }

    static async updateSensor(cityId: string, id: string, data: any) {
        const sensor = await ElectricitySensor.findOneAndUpdate(
            { _id: id, cityId },
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!sensor) throw AppError.notFound('Electricity Sensor not found');
        return sensor;
    }

    static async getSensorHistory(cityId: string, sensorId: string, limit: number = 100, startTime?: Date, endTime?: Date) {
        const query: any = { cityId, sensorId };
        if (startTime || endTime) {
            query.recordedAt = {};
            if (startTime) query.recordedAt.$gte = startTime;
            if (endTime) query.recordedAt.$lte = endTime;
        }

        return ElectricitySensorReading.find(query).sort({ recordedAt: -1 }).limit(limit);
    }
}
