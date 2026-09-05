import { GarbageVehicle } from '../../models/GarbageVehicle';
import { Driver } from '../../models/Driver';
import { AppError } from '../../utils/AppError';
import { VehicleStatus, DriverStatus } from '../../constants/garbage';

export interface CreateVehicleDTO {
    cityId: string;
    vehicleNumber: string;
    vehicleName?: string;
    vehicleType?: string;
    capacity?: number;
    driverId?: string;
    status?: VehicleStatus;
    active?: boolean;
    notes?: string;
}

export interface UpdateVehicleDTO extends Partial<CreateVehicleDTO> { }

export class GarbageVehicleService {
    async createVehicle(data: CreateVehicleDTO) {
        const existing = await GarbageVehicle.findOne({ cityId: data.cityId, vehicleNumber: data.vehicleNumber });
        if (existing) {
            throw AppError.conflict('A vehicle with this number already exists in this city');
        }

        if (data.driverId) {
            const driver = await Driver.findOne({ _id: data.driverId, cityId: data.cityId });
            if (!driver) throw AppError.badRequest('Invalid driver or driver belongs to another city');
        }

        const vehicle = await GarbageVehicle.create({
            ...data,
            status: data.status || VehicleStatus.AVAILABLE
        });
        return vehicle;
    }

    async getVehicles(filters: Record<string, any> = {}) {
        return GarbageVehicle.find(filters).populate('driverId').sort({ createdAt: -1 });
    }

    async getVehicleById(id: string) {
        const vehicle = await GarbageVehicle.findById(id).populate('driverId');
        if (!vehicle) {
            throw AppError.notFound('Vehicle not found');
        }
        return vehicle;
    }

    async updateVehicle(id: string, data: UpdateVehicleDTO) {
        const vehicle = await GarbageVehicle.findById(id);
        if (!vehicle) throw AppError.notFound('Vehicle not found');

        if (data.vehicleNumber && data.vehicleNumber !== vehicle.vehicleNumber) {
            const existing = await GarbageVehicle.findOne({
                _id: { $ne: id },
                cityId: vehicle.cityId,
                vehicleNumber: data.vehicleNumber
            });
            if (existing) throw AppError.conflict('A vehicle with this number already exists in this city');
        }

        if (data.driverId) {
            const driver = await Driver.findOne({ _id: data.driverId, cityId: vehicle.cityId });
            if (!driver) throw AppError.badRequest('Invalid driver or driver belongs to another city');
        }

        Object.assign(vehicle, data);
        await vehicle.save();
        return vehicle;
    }
}

export const garbageVehicleService = new GarbageVehicleService();
