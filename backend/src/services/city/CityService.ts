/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { City } from '../../models';
import { AppError } from '../../utils/AppError';
import { CityStatus } from '../../constants/roles';

export interface CreateCityDTO {
    name: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    status?: string;
}

export interface UpdateCityDTO extends Partial<CreateCityDTO> { }

export class CityService {
    async createCity(data: CreateCityDTO) {
        const existing = await City.findOne({
            name: { $regex: new RegExp(`^${data.name}$`, 'i') },
            state: { $regex: new RegExp(`^${data.state}$`, 'i') },
        });

        if (existing) {
            throw AppError.conflict(`City '${data.name}' already exists in '${data.state}'`);
        }

        const city = await City.create({
            ...data,
            location: {
                type: 'Point',
                coordinates: [data.longitude, data.latitude] // GeoJSON format
            },
            status: data.status || CityStatus.ACTIVE
        });

        return city;
    }

    async getCities(filters: Record<string, any> = {}) {
        return City.find(filters).sort({ createdAt: -1 });
    }

    async getCityById(id: string) {
        const city = await City.findById(id);
        if (!city) {
            throw AppError.notFound('City not found');
        }
        return city;
    }

    async updateCity(id: string, data: UpdateCityDTO) {
        const city = await City.findById(id);
        if (!city) {
            throw AppError.notFound('City not found');
        }

        if (data.name || data.state) {
            const checkName = data.name || city.name;
            const checkState = data.state || city.state;
            const existing = await City.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${checkName}$`, 'i') },
                state: { $regex: new RegExp(`^${checkState}$`, 'i') },
            });
            if (existing) {
                throw AppError.conflict(`City '${checkName}' already exists in '${checkState}'`);
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

        Object.assign(city, updatePayload);
        await city.save();
        return city;
    }
}

export const cityService = new CityService();
