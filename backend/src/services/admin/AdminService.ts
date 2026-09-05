/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { User, City } from '../../models';
import { AppError } from '../../utils/AppError';
import { Role, UserStatus } from '../../constants/roles';
import { hashPassword } from '../../utils/password';

export interface CreateAdminDTO {
    email: string;
    plaintext: string;
    firstName: string;
    lastName: string;
    phone?: string;
    cityId?: string;
    role: Role;
}

export interface UpdateAdminDTO {
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: UserStatus;
    role?: Role;
}

export class AdminService {
    async getProfile(id: string) {
        const admin = await User.findById(id).select('-passwordHash');
        if (!admin) {
            throw AppError.notFound('Profile not found');
        }
        return admin;
    }

    async updateProfile(id: string, data: { firstName?: string, lastName?: string, phone?: string }) {
        const admin = await User.findById(id);
        if (!admin) {
            throw AppError.notFound('Profile not found');
        }

        if (data.firstName) admin.firstName = data.firstName;
        if (data.lastName) admin.lastName = data.lastName;
        if (data.phone) admin.phone = data.phone;

        await admin.save();

        const updated = admin.toObject();
        delete (updated as any).passwordHash;
        return updated;
    }

    async createCityAdmin(data: CreateAdminDTO) {
        if (data.role !== Role.CITY_ADMIN && data.role !== Role.SUPER_ADMIN) {
            throw AppError.badRequest('Invalid admin role');
        }

        const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
        if (existing) {
            throw AppError.conflict('An account with this email already exists');
        }

        if (data.role === Role.CITY_ADMIN) {
            if (!data.cityId) throw AppError.badRequest('cityId is required for CITY_ADMIN');
            const city = await City.findById(data.cityId);
            if (!city) throw AppError.notFound('Assigned city not found');
            if (city.status !== 'ACTIVE') throw AppError.badRequest('Cannot assign admin to an inactive city');
        }

        const passwordHash = await hashPassword(data.plaintext);

        const admin = await User.create({
            email: data.email.toLowerCase().trim(),
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role,
            cityId: data.cityId,
            status: UserStatus.ACTIVE
        });

        const result = admin.toObject();
        delete (result as any).passwordHash;
        return result;
    }

    async getCityAdmins(filters: Record<string, any> = {}) {
        return User.find({ ...filters, role: Role.CITY_ADMIN })
            .select('-passwordHash')
            .sort({ createdAt: -1 });
    }

    async getCityAdminById(id: string) {
        const admin = await User.findOne({ _id: id, role: Role.CITY_ADMIN }).select('-passwordHash');
        if (!admin) {
            throw AppError.notFound('City Admin not found');
        }
        return admin;
    }

    async updateCityAdmin(id: string, data: UpdateAdminDTO) {
        const admin = await User.findOne({ _id: id, role: Role.CITY_ADMIN });
        if (!admin) throw AppError.notFound('City Admin not found');

        if (data.firstName) admin.firstName = data.firstName;
        if (data.lastName) admin.lastName = data.lastName;
        if (data.phone) admin.phone = data.phone;
        if (data.status) admin.status = data.status;
        if (data.role) admin.role = data.role; // Note: if role changes to non-city admin, it moves out of this filter

        await admin.save();
        const result = admin.toObject();
        delete (result as any).passwordHash;
        return result;
    }
}

export const adminService = new AdminService();
