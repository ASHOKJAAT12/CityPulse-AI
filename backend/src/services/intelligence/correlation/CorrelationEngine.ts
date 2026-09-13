import { AnomalyDetection } from '../../../models/AnomalyDetection';
import { CitizenReport } from '../../../models/CitizenReport';
import { IntelligenceEvent } from '../../../models/IntelligenceEvent';
import mongoose from 'mongoose';

export class CorrelationEngine {
    /**
     * Determines whether an incoming Anomaly should spawn a new Intelligence Event
     * or append to an existing one based on geographic and temporal proximity.
     */
    static async correlate(anomaly: any): Promise<any | null> {
        // Temporal Window (Last 4 Hours)
        const timeWindow = new Date(Date.now() - 4 * 60 * 60 * 1000);

        const targetLocation: any = null;

        // 1. Fetch location for the anomaly source if it's geospatial
        if (anomaly.service === 'WATER' || anomaly.service === 'ELECTRICITY' || anomaly.service === 'STREETLIGHT' || anomaly.service === 'TRAFFIC') {
            // Very simplified spatial grab for hackathon setup
            // In full production, we'd query the Asset or Sensor for its specific geo-coordinates
            // We'll rely on CitizenReports overlapping instead as the primary spatial pivot
        }

        // 2. See if there are recent anomalies in the same service category
        const relatedAnomalies = await AnomalyDetection.find({
            cityId: anomaly.cityId,
            status: 'ACTIVE',
            service: anomaly.service,
            _id: { $ne: anomaly._id },
            detectedAt: { $gte: timeWindow }
        });

        // 3. Look for recent citizen reports pointing to the same issue domain
        let reportCategory = '';
        if (anomaly.service === 'WATER') reportCategory = 'WATER_SUPPLY';
        if (anomaly.service === 'ELECTRICITY') reportCategory = 'ELECTRICITY';
        if (anomaly.service === 'TRAFFIC') reportCategory = 'ROADS_TRAFFIC';
        if (anomaly.service === 'STREETLIGHT') reportCategory = 'STREETLIGHTS';
        if (anomaly.service === 'GARBAGE') reportCategory = 'WASTE_GARBAGE';

        const relatedReports = await CitizenReport.find({
            cityId: anomaly.cityId,
            category: reportCategory,
            status: { $nin: ['CLOSED', 'RESOLVED', 'REJECTED'] },
            createdAt: { $gte: timeWindow }
        });

        // If we found NO related factors, it's just a rogue anomaly. 
        // We only create an IntelligenceEvent if Confidence is high or Correlated evidence exists.
        const evidence: string[] = [`Primary Anomaly Detected: ${anomaly.metric} (${anomaly.method})`];

        if (relatedAnomalies.length > 0) {
            evidence.push(`Correlated with ${relatedAnomalies.length} other ${anomaly.service} anomalies within 4 hours.`);
        }
        if (relatedReports.length > 0) {
            evidence.push(`Supported by ${relatedReports.length} incoming citizen complaints relating to ${reportCategory}.`);
        }

        if (relatedAnomalies.length === 0 && relatedReports.length === 0 && anomaly.severity !== 'CRITICAL') {
            // Not enough cross-factor evidence or severity to wake up Command Center
            return null;
        }

        const titleMap: Record<string, string> = {
            'WATER': 'Potential Water Infrastructure Stress',
            'ELECTRICITY': 'Local Grid Instability Detected',
            'TRAFFIC': 'Severe Traffic Congestion Event',
            'EV': 'Charging Network Degraded',
            'STREETLIGHT': 'Streetlight Zone Outage',
            'GARBAGE': 'Waste Collection Operational Delay',
            'CITIZEN_REPORT': 'Critical Citizen Complaint Hotspot'
        };

        const existingEvent = await IntelligenceEvent.findOne({
            cityId: anomaly.cityId,
            service: anomaly.service,
            status: { $in: ['DETECTED', 'UNDER_REVIEW', 'ACTION_RECOMMENDED'] }
        });

        if (existingEvent) {
            // Append
            existingEvent.evidence = [...new Set([...existingEvent.evidence, ...evidence])];
            existingEvent.updatedAt = new Date();
            // Confidence goes up when correlated
            existingEvent.confidence = Math.min(100, existingEvent.confidence + 10);
            await existingEvent.save();
            return existingEvent;
        }

        const newEvent = new IntelligenceEvent({
            cityId: anomaly.cityId,
            service: anomaly.service,
            eventType: relatedReports.length > 0 ? 'CROSS_SERVICE' : 'ANOMALY',
            sourceType: anomaly.sourceType,
            sourceId: anomaly.sourceId,
            severity: anomaly.severity,
            riskScore: 0, // Computed downstream
            confidence: Math.min(100, anomaly.confidence + (relatedReports.length * 15)),
            title: titleMap[anomaly.service] || 'System Abnormality Detected',
            summary: `Automated intelligence identified potential service degradation. Evidence from ${1 + relatedAnomalies.length} sensors and ${relatedReports.length} citizens.`,
            status: 'DETECTED',
            evidence
        });

        return await newEvent.save();
    }
}
