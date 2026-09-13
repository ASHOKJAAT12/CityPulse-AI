import { Types } from 'mongoose';
import { CityKPIEngine } from './CityKPIEngine';

export class ServiceComparisonEngine {

    /**
     * Compares multiple cities (SUPER_ADMIN only usually)
     * We map the CityKPIEngine results for an array of city IDs.
     */
    static async compareCities(cityIds: string[]) {
        const comparisons = [];
        for (const id of cityIds) {
            const dashboard = await CityKPIEngine.getDashboard(id);
            const health = await CityKPIEngine.getCityHealth(id);
            comparisons.push({
                cityId: id,
                dashboard,
                health
            });
        }
        return comparisons;
    }

    /**
     * Deep dive comparison metrics for a singular service over a range.
     * Normalized performance per service type.
     */
    static async getServiceMetrics(cityId: string, service: string, timeRange: string) {
        // Standardized template fallback for Phase 15.
        // Service should be validated.
        return {
            serviceType: service.toUpperCase(),
            metrics: {
                uptime: '99.9%',
                activeIncidents: 0,
                averageResolutionHours: 2.5,
                peakLoad: 'STABLE'
            },
            timeRange
        };
    }
}
