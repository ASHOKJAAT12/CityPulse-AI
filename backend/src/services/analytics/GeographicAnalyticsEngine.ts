import { Types } from 'mongoose';
import { CitizenReport, EmergencyIncident, TrafficIncident } from '../../models';

export class GeographicAnalyticsEngine {

    /**
     * Retrieve hotspots for analytics map overlay
     * In a real high volume system we would use $geoNear and clustering/aggregation.
     * For Phase 15 we return explicit active high-priority points for the heatmap.
     */
    static async getHotspots(cityId: string) {
        const _cityId = new Types.ObjectId(cityId);

        // Fetch unresolved emergencies
        const emergencies = await EmergencyIncident.find(
            { cityId: _cityId, status: { $nin: ['RESOLVED', 'CLOSED', 'CANCELLED'] }, location: { $exists: true } },
            'location severity title'
        ).lean();

        // Fetch unresolved traffic
        const traffic = await TrafficIncident.find(
            { cityId: _cityId, status: { $ne: 'RESOLVED' }, location: { $exists: true } },
            'location severity title'
        ).lean();

        // Fetch unresolved citizen reports mapped as infrastructure failures
        const reports = await CitizenReport.find(
            { cityId: _cityId, status: { $ne: 'RESOLVED' }, location: { $exists: true } },
            'location category title'
        ).lean();

        const combined = [
            ...emergencies.map(e => ({ type: 'EMERGENCY', coordinates: e.location?.coordinates, severity: e.severity, title: e.title })),
            ...traffic.map(t => ({ type: 'TRAFFIC', coordinates: t.location?.coordinates, severity: t.severity, title: t.title })),
            ...reports.map(r => ({ type: 'REPORT', coordinates: r.location?.coordinates, severity: 'LOW', title: r.title }))
        ];

        return combined;
    }
}
