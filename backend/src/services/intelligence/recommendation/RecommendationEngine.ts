import { Recommendation } from '../../../models/Recommendation';
import mongoose from 'mongoose';

export class RecommendationEngine {
    static async generate(intelligenceEvent: any): Promise<void> {
        // Simple rules-based recommendation engine mapping conditions to actionable tasks
        const existing = await Recommendation.find({ intelligenceEventId: intelligenceEvent._id });
        if (existing.length > 0) return; // Recommend once per event until dismissed or completed

        const actions: { title: string, desc: string, priority: string, reason: string }[] = [];

        if (intelligenceEvent.service === 'WATER') {
            actions.push({
                title: 'Dispatch Pipeline Inspection',
                desc: 'Send maintenance field crew to sector to search for pipeline bursts or leaks.',
                priority: intelligenceEvent.severity,
                reason: 'Water pressure drops often indicate a compromised main supply line.'
            });
        }

        if (intelligenceEvent.service === 'ELECTRICITY' && intelligenceEvent.severity === 'CRITICAL') {
            actions.push({
                title: 'Initiate Grid Reroute',
                desc: 'Assess adjacent transformers to absorb load and prevent cascading failures.',
                priority: 'CRITICAL',
                reason: 'Extreme power drops or overloads require immediate dynamic load balancing.'
            });
        }

        if (intelligenceEvent.service === 'GARBAGE') {
            actions.push({
                title: 'Dispatch Backup Vehicle',
                desc: 'Assign standby vehicle to incomplete sector to prevent waste pile-up.',
                priority: 'MEDIUM',
                reason: 'Primary vehicle tracking indicates substantial unrecoverable route delays.'
            });
        }

        for (const action of actions) {
            const recommendation = new Recommendation({
                cityId: intelligenceEvent.cityId,
                intelligenceEventId: intelligenceEvent._id,
                title: action.title,
                description: action.desc,
                action: action.title,
                priority: action.priority,
                reason: action.reason,
                status: 'NEW'
            });
            await recommendation.save();

            // Mark Intelligence Event as actionable
            intelligenceEvent.status = 'ACTION_RECOMMENDED';
            await intelligenceEvent.save();
        }
    }
}
