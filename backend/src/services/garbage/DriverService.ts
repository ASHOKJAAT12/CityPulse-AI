import { Driver } from '../../models/Driver';
import { AppError } from '../../utils/AppError';
import { DriverStatus } from '../../constants/garbage';

export interface CreateDriverDTO {
    cityId: string;
    name: string;
    mobile: string;
    employeeId?: string;
    status?: DriverStatus;
}

export interface UpdateDriverDTO extends Partial<CreateDriverDTO> { }

export class DriverService {
    async createDriver(data: CreateDriverDTO) {
        const existing = await Driver.findOne({ cityId: data.cityId, mobile: data.mobile });
        if (existing) {
            throw AppError.conflict('A driver with this mobile number already exists in this city');
        }

        const driver = await Driver.create({
            ...data,
            status: data.status || DriverStatus.ACTIVE
        });
        return driver;
    }

    async getDrivers(filters: Record<string, any> = {}) {
        return Driver.find(filters).sort({ createdAt: -1 });
    }

    async getDriverById(id: string) {
        const driver = await Driver.findById(id);
        if (!driver) {
            throw AppError.notFound('Driver not found');
        }
        return driver;
    }

    async updateDriver(id: string, data: UpdateDriverDTO) {
        const driver = await this.getDriverById(id);

        if (data.mobile && data.mobile !== driver.mobile) {
            const existing = await Driver.findOne({
                _id: { $ne: id },
                cityId: driver.cityId,
                mobile: data.mobile
            });
            if (existing) {
                throw AppError.conflict('A driver with this mobile number already exists in this city');
            }
        }

        Object.assign(driver, data);
        await driver.save();
        return driver;
    }
}

export const driverService = new DriverService();
