import { Types } from 'mongoose';
import { CityDepartment } from '../../models';
import { AppError } from '../../utils/AppError';

export class DepartmentService {
    static async createDepartment(cityId: string, departmentData: { name: string; code: string; description?: string; categories: string[] }) {
        const exists = await CityDepartment.findOne({ cityId, code: departmentData.code });
        if (exists) {
            throw AppError.badRequest('Department code already exists in this city');
        }

        const department = await CityDepartment.create({
            cityId: new Types.ObjectId(cityId),
            ...departmentData
        });
        return department;
    }

    static async getDepartments(cityId: string) {
        return CityDepartment.find({ cityId: new Types.ObjectId(cityId), active: true }).sort({ name: 1 });
    }

    static async getDepartmentById(cityId: string, departmentId: string) {
        const dept = await CityDepartment.findOne({ _id: new Types.ObjectId(departmentId), cityId: new Types.ObjectId(cityId) });
        if (!dept) {
            throw AppError.notFound('Department not found in your city');
        }
        return dept;
    }

    static async findDepartmentForCategory(cityId: string, category: string) {
        // Automatically maps the report category to a matching administrative department
        return CityDepartment.findOne({ cityId: new Types.ObjectId(cityId), categories: category, active: true });
    }
}
