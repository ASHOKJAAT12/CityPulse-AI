import { CitizenReport } from '../../../models';
import { AnomalyDetection } from '../../../models/AnomalyDetection';
import mongoose from 'mongoose';

export class CitizenReportIntelligenceEngine {
    static async detectHotspot(report: any): Promise<void> {
        // Detects if there is a sudden cluster of reports in a specific area.
        const radiusMeters = 200;
        const timeWindowHours = 12;
        const threshold = 3;

        const timeWindowStr = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

        const recentReports = await CitizenReport.find({
            cityId: report.cityId,
            status: { $nin: ['CLOSED', 'REJECTED'] },
            createdAt: { $gte: timeWindowStr },
            location: {
                $near: {
                    $geometry: report.location,
                    $maxDistance: radiusMeters
                }
            }
        });

        if (recentReports.length >= threshold) {
            // Hotspot detected!
            // Deduplicate anomaly creation
            const existingAnomaly = await AnomalyDetection.findOne({
                cityId: report.cityId,
                service: 'CITIZEN_REPORT',
                metric: 'HOTSPOT_DENSITY',
                status: 'ACTIVE',
                observedValue: { $lt: recentReports.length } // Update if density increased
            });

            if (existingAnomaly) {
                existingAnomaly.observedValue = recentReports.length;
                existingAnomaly.updatedAt = new Date();
                await existingAnomaly.save();
                return;
            }

            const activeAnomaly = await AnomalyDetection.findOne({
                cityId: report.cityId,
                service: 'CITIZEN_REPORT',
                metric: 'HOTSPOT_DENSITY',
                status: 'ACTIVE'
            });

            if (activeAnomaly) return; // Already tracking safely

            const anomaly = new AnomalyDetection({
                cityId: report.cityId,
                service: 'CITIZEN_REPORT',
                sourceType: 'CLUSTER',
                metric: 'HOTSPOT_DENSITY',
                observedValue: recentReports.length,
                expectedValue: 1,
                deviation: recentReports.length - 1,
                severity: recentReports.length > 5 ? 'HIGH' : 'MEDIUM',
                confidence: 90,
                method: 'THRESHOLD', // Density threshold clustering
                status: 'ACTIVE',
                evidence: [
                    `${recentReports.length} reports logged within ${radiusMeters}m over the last ${timeWindowHours}h.`,
                    `Categories mapped: ${[...new Set(recentReports.map(r => r.category))].join(', ')}`
                ]
            });

            await anomaly.save();

            const { intelligenceBus } = require('../IntelligenceEventEmitter');
            intelligenceBus.emit('anomaly:detected', anomaly);
        }
    }
}
