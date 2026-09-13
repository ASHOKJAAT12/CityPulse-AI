import { AppError } from '../../utils/AppError';
import { PowerOutage, ElectricityMaintenance, ElectricityAsset } from '../../models';
import { emitToCityRoom } from '../../websocket';
import { notificationService, NotificationAudience } from '../notification/NotificationService';

export class OutageService {
    // ─── OUTAGES ────────────────────────────────────────────────────────────

    static async getOutagesByCity(cityId: string, filter: Record<string, unknown> = {}, limit: number = 100, page: number = 1) {
        const query = { cityId, ...filter };
        const skip = (page - 1) * limit;
        return PowerOutage.find(query).skip(skip).limit(limit).sort({ startedAt: -1 });
    }

    static async getOutageById(cityId: string, id: string) {
        const outage = await PowerOutage.findOne({ _id: id, cityId });
        if (!outage) throw AppError.notFound('Power Outage not found');
        return outage;
    }

    static async createOutage(cityId: string, userId: string, data: any) {
        if (data.assetId) {
            const asset = await ElectricityAsset.findOne({ _id: data.assetId, cityId });
            if (!asset) throw AppError.notFound('Electricity Asset not found');
        }

        const outage = new PowerOutage({
            ...data,
            cityId,
            createdBy: userId
        });
        await outage.save();

        emitToCityRoom(cityId, 'electricity:outage-created', outage);

        // Notify city about outage
        await notificationService.send({
            cityId: cityId,
            audience: NotificationAudience.CITY,
            category: 'ELECTRICITY',
            priority: 'HIGH',
            title: `Power Outage Reported`,
            message: `A power outage has been reported in your area: ${outage.cause || 'Under investigation'}`,
            referenceType: 'POWER_OUTAGE',
            referenceId: outage._id.toString()
        });
        return outage;
    }

    static async updateOutage(cityId: string, id: string, data: any) {
        const outage = await PowerOutage.findOne({ _id: id, cityId });
        if (!outage) throw AppError.notFound('Power Outage not found');

        const previousStatus = outage.status;
        Object.assign(outage, data);

        if (['RESTORED', 'CANCELLED'].includes(outage.status as string) && !['RESTORED', 'CANCELLED'].includes(previousStatus)) {
            outage.actualRestorationAt = data.actualRestorationAt ? new Date(data.actualRestorationAt) : new Date();
        }

        await outage.save();
        emitToCityRoom(cityId, 'electricity:outage-updated', outage);

        if (['RESTORED', 'CANCELLED'].includes(outage.status as string) && !['RESTORED', 'CANCELLED'].includes(previousStatus)) {
            await notificationService.send({
                cityId: cityId,
                audience: NotificationAudience.CITY,
                category: 'ELECTRICITY',
                priority: 'INFO',
                title: `Power Outage ${outage.status}`,
                message: `The previously reported power outage has been ${outage.status.toLowerCase()}.`,
                referenceType: 'POWER_OUTAGE',
                referenceId: outage._id.toString()
            });
        }
        return outage;
    }

    // ─── MAINTENANCE ────────────────────────────────────────────────────────

    static async getMaintenanceByCity(cityId: string, filter: Record<string, unknown> = {}, limit: number = 100, page: number = 1) {
        const query = { cityId, ...filter };
        const skip = (page - 1) * limit;
        return ElectricityMaintenance.find(query).skip(skip).limit(limit).sort({ scheduledStart: -1 });
    }

    static async createMaintenance(cityId: string, userId: string, data: any) {
        const asset = await ElectricityAsset.findOne({ _id: data.assetId, cityId });
        if (!asset) throw AppError.notFound('Electricity Asset not found');

        const maintenance = new ElectricityMaintenance({
            ...data,
            cityId,
            createdBy: userId
        });
        await maintenance.save();

        emitToCityRoom(cityId, 'electricity:maintenance-updated', maintenance);
        return maintenance;
    }

    static async updateMaintenance(cityId: string, id: string, data: any) {
        const maintenance = await ElectricityMaintenance.findOne({ _id: id, cityId });
        if (!maintenance) throw AppError.notFound('Maintenance task not found');

        Object.assign(maintenance, data);

        if (maintenance.status === 'COMPLETED' && !maintenance.completedAt) {
            maintenance.completedAt = new Date();
        }

        await maintenance.save();
        emitToCityRoom(cityId, 'electricity:maintenance-updated', maintenance);
        return maintenance;
    }
}
