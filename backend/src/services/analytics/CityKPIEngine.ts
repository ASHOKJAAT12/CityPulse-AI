import { AnalyticsMetric, WaterIncident, TrafficIncident, EmergencyIncident, ElectricityIncident, GarbageRoute, CitizenReport, EVIncident, StreetlightIncident } from '../../models';
import { Types } from 'mongoose';
import logger from '../../utils/logger';

export class CityKPIEngine {

    /**
     * Retrieves the high-level dashboard metrics for a given city
     * This queries actual current values directly from operational collections
     */
    static async getDashboard(cityId: string) {
        const _cityId = new Types.ObjectId(cityId);

        // 1. Calculate general service health
        const totalEmergency = await EmergencyIncident.countDocuments({ cityId: _cityId, status: { $nin: ['RESOLVED', 'CLOSED', 'CANCELLED', 'FALSE_ALARM'] } });
        const totalWater = await WaterIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });
        const totalTraffic = await TrafficIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });
        const totalElectricity = await ElectricityIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });
        const totalGarbageDelay = await GarbageRoute.countDocuments({ cityId: _cityId, status: 'DELAYED' });

        // 2. Open citizen reports
        const openReports = await CitizenReport.countDocuments({ cityId: _cityId, status: { $in: ['SUBMITTED', 'IN_PROGRESS'] } });

        // Simple City Health Formulation: Starts at 100, drops down per active negative incident
        let cityHealthScore = 100 - (totalEmergency * 5) - (totalWater * 1) - (totalTraffic * 1) - (totalElectricity * 1.5) - (totalGarbageDelay * 0.5);
        if (cityHealthScore < 0) cityHealthScore = 0;

        return {
            overallHealth: cityHealthScore,
            activeEmergencies: totalEmergency,
            activeIncidents: totalWater + totalTraffic + totalElectricity,
            openCitizenReports: openReports,
            garbageRoutesDelayed: totalGarbageDelay,
            lastCalculated: new Date()
        };
    }

    /**
     * City Health specific metrics by service
     */
    static async getCityHealth(cityId: string) {
        const _cityId = new Types.ObjectId(cityId);

        const water = await WaterIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });
        const power = await ElectricityIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });
        const traffic = await TrafficIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });
        const ev = await EVIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });
        const lights = await StreetlightIncident.countDocuments({ cityId: _cityId, status: { $ne: 'RESOLVED' } });

        return {
            waterIncidents: water,
            electricityIncidents: power,
            trafficIssues: traffic,
            evIssues: ev,
            streetlightIssues: lights
        };
    }

    /**
     * Generate operational metrics about specific departments (time to resolve etc.)
     * In a production environment this would be an aggregation pipeline across resolved reports.
     */
    static async getDepartmentMetrics(cityId: string) {
        const _cityId = new Types.ObjectId(cityId);

        const aggregation = await CitizenReport.aggregate([
            { $match: { cityId: _cityId, status: 'RESOLVED', resolutionDate: { $exists: true } } },
            {
                $group: {
                    _id: "$category",
                    totalResolved: { $sum: 1 },
                    avgResolutionMillis: { $avg: { $subtract: ["$resolutionDate", "$createdAt"] } }
                }
            }
        ]);

        return aggregation.map(a => ({
            department: a._id || 'General',
            totalResolved: a.totalResolved,
            avgResolutionHours: (a.avgResolutionMillis / (1000 * 60 * 60)).toFixed(2)
        }));
    }

    static async getEmergencyAnalytics(cityId: string) {
        const _cityId = new Types.ObjectId(cityId);
        const total = await EmergencyIncident.countDocuments({ cityId: _cityId });
        const critical = await EmergencyIncident.countDocuments({ cityId: _cityId, severity: 'CRITICAL' });
        const unresolved = await EmergencyIncident.countDocuments({ cityId: _cityId, status: { $nin: ['RESOLVED', 'CLOSED', 'CANCELLED'] } });

        return {
            totalEmergencies: total,
            criticalCount: critical,
            unresolvedCount: unresolved
        };
    }

    static async getAIAnalytics(cityId: string) {
        // Fallback dummy to be connected to actual AI collections if needed
        return {
            insightsGenerated: 0,
            activePredictions: 0,
            recommendationMatches: 0
        };
    }

    static async getCitizenReportAnalytics(cityId: string) {
        const _cityId = new Types.ObjectId(cityId);
        const latestTime = Date.now();
        const thirtyDaysAgo = new Date(latestTime - 30 * 24 * 60 * 60 * 1000);

        const recentReports = await CitizenReport.countDocuments({ cityId: _cityId, createdAt: { $gte: thirtyDaysAgo } });
        const closedReports = await CitizenReport.countDocuments({ cityId: _cityId, status: 'RESOLVED', createdAt: { $gte: thirtyDaysAgo } });

        let resolutionRate = 0;
        if (recentReports > 0) resolutionRate = (closedReports / recentReports) * 100;

        return {
            reportsLast30Days: recentReports,
            resolvedLast30Days: closedReports,
            resolutionRate: resolutionRate.toFixed(1)
        };
    }
}
