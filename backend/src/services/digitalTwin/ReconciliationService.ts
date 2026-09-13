import { DigitalTwinNode, DigitalTwinRelationship } from '../../models';
import logger from '../../utils/logger';

export class DigitalTwinReconciliationService {
    /**
     * Audits and repairs orphaned relationships where either the source or target node no longer exists.
     */
    static async cleanOrphanRelationships(cityId: string) {
        logger.info(`Starting Digital Twin Reconciliation for city: ${cityId}`);

        // 1. Find all relationships for the city
        const relationships = await DigitalTwinRelationship.find({ cityId });
        let deletedCount = 0;

        for (const rel of relationships) {
            const sourceExists = await DigitalTwinNode.exists({ _id: rel.sourceNodeId });
            const targetExists = await DigitalTwinNode.exists({ _id: rel.targetNodeId });

            if (!sourceExists || !targetExists) {
                logger.warn(`Orphan relationship found. Deleting Rel ID: ${rel._id}`);
                await DigitalTwinRelationship.deleteOne({ _id: rel._id });
                deletedCount++;
            }
        }

        logger.info(`Reconciliation complete for city: ${cityId}. Removed ${deletedCount} orphan relationships.`);
        return { success: true, removedCount: deletedCount };
    }

    /**
     * Resets stale statuses for nodes that haven't been updated in a long time, falling back to Source modules.
     */
    static async flagStaleNodes(cityId: string, maxAgeHours = 24) {
        const threshold = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));

        const result = await DigitalTwinNode.updateMany(
            { cityId, updatedAt: { $lt: threshold }, status: { $nin: ['UNKNOWN', 'OFFLINE'] } },
            { $set: { status: 'UNKNOWN' } }
        );

        logger.info(`Flagged ${result.modifiedCount} stale nodes globally for city ${cityId}.`);
        return { flaggedCount: result.modifiedCount };
    }
}
