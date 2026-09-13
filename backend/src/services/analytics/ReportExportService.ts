import { Types } from 'mongoose';
import { CityKPIEngine } from './CityKPIEngine';
import { TrendEngine } from './TrendEngine';

export class ReportExportService {

    /**
     * Generates a structural JSON export for city statistics
     */
    static async generateExport(cityId: string, format: string, metricsRequested: string[], startDate?: string, endDate?: string) {
        // Normally we'd filter strictly by startDate and endDate directly in aggregate.
        // For Phase 15 MVP we retrieve snapshot dashboard stats.

        const health = await CityKPIEngine.getCityHealth(cityId);
        const trends = await TrendEngine.getOverallTrends(cityId);
        const emergency = await CityKPIEngine.getEmergencyAnalytics(cityId);

        const payload = {
            cityId,
            generatedAt: new Date().toISOString(),
            dateRange: { start: startDate, end: endDate },
            health,
            trends,
            emergency
        };

        if (format === 'csv') {
            return this.convertToCSV(payload);
        }

        return JSON.stringify(payload, null, 2);
    }

    private static convertToCSV(payload: any): string {
        // Simple flattening converter for MVP
        let csv = 'Metric,Value\n';
        csv += `GeneratedAt,${payload.generatedAt}\n`;

        for (const [key, value] of Object.entries(payload.health)) {
            csv += `Health_${key},${value}\n`;
        }

        for (const [key, val] of Object.entries(payload.emergency)) {
            csv += `Emergency_${key},${val}\n`;
        }

        return csv;
    }
}
