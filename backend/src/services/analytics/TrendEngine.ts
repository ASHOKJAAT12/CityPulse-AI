import { Types } from 'mongoose';
import { CitizenReport, EmergencyIncident, TrafficIncident } from '../../models';

export class TrendEngine {

    /**
     * Compare current window vs previous window
     * For example, last 7 days vs previous 7 days
     */
    static async getOverallTrends(cityId: string) {
        const _cityId = new Types.ObjectId(cityId);

        const now = Date.now();
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

        // Current week aggregation
        const currentReports = await CitizenReport.countDocuments({ cityId: _cityId, createdAt: { $gte: oneWeekAgo } });
        const prevReports = await CitizenReport.countDocuments({ cityId: _cityId, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } });

        const currentTraffic = await TrafficIncident.countDocuments({ cityId: _cityId, createdAt: { $gte: oneWeekAgo } });
        const prevTraffic = await TrafficIncident.countDocuments({ cityId: _cityId, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } });

        const currentEmergencies = await EmergencyIncident.countDocuments({ cityId: _cityId, createdAt: { $gte: oneWeekAgo } });
        const prevEmergencies = await EmergencyIncident.countDocuments({ cityId: _cityId, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } });

        // Generate TimeSeries (Last 7 Days) for Recharts Charting
        const timeSeries = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(now - i * 24 * 60 * 60 * 1000);
            dayStart.setHours(0, 0, 0, 0); // start of day
            const dayEnd = new Date(now - i * 24 * 60 * 60 * 1000);
            dayEnd.setHours(23, 59, 59, 999); // end of day

            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dayStart);

            const incidentsCount = await TrafficIncident.countDocuments({ cityId: _cityId, createdAt: { $gte: dayStart, $lte: dayEnd } });
            const reportsCount = await CitizenReport.countDocuments({ cityId: _cityId, createdAt: { $gte: dayStart, $lte: dayEnd } });

            timeSeries.push({
                name: dayName,
                incidents: incidentsCount,
                reports: reportsCount
            });
        }

        return {
            periodSelected: '7d',
            citizenReports: this.calculateTrend(currentReports, prevReports),
            trafficIncidents: this.calculateTrend(currentTraffic, prevTraffic),
            emergencies: this.calculateTrend(currentEmergencies, prevEmergencies),
            timeSeries
        };
    }

    private static calculateTrend(current: number, previous: number) {
        if (previous === 0 && current === 0) return { current, previous, change: 0, trend: 'STABLE' };
        if (previous === 0) return { current, previous, change: current * 100, trend: 'WORSENING' }; // since these are incident counts, more is usually worse

        const change = ((current - previous) / previous) * 100;
        let trend = 'STABLE';
        if (change > 5) trend = 'WORSENING';
        if (change < -5) trend = 'IMPROVING';

        return { current, previous, change: parseFloat(change.toFixed(2)), trend };
    }
}
