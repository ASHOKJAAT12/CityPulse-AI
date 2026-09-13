import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { DigitalTwinNode, DigitalTwinRelationship, DigitalTwinSnapshot } from '../models';
import { ErrorCode } from '../utils/AppError';
import { Types } from 'mongoose';
import logger from '../utils/logger';

/**
 * Validates City Authentication context globally
 */
const getCityId = (req: Request) => {
    // If SUPER_ADMIN (cityId is null) but they appended a specific city filter, use it
    if (!req.user?.cityId) {
        if (req.query.cityId) return req.query.cityId as string;
        throw new Error('SUPER_ADMIN requires ?cityId= query parsing');
    }
    return req.user.cityId;
};

export const getNodes = async (req: Request, res: Response) => {
    try {
        const cityId = getCityId(req);

        let filter: any = { cityId: new Types.ObjectId(cityId), visible: true };
        if (req.query.domain) filter.domain = req.query.domain;
        if (req.query.status) filter.status = req.query.status;

        // Geospatial Bounding Box
        if (req.query.bbox) {
            const [swLng, swLat, neLng, neLat] = (req.query.bbox as string).split(',').map(Number);
            filter.location = {
                $geoWithin: {
                    $box: [
                        [swLng, swLat],
                        [neLng, neLat]
                    ]
                }
            };
        }

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 500; // Hard bounded pagination

        const nodes = await DigitalTwinNode.find(filter)
            .limit(limit)
            .lean();

        sendSuccess(res, { nodes, count: nodes.length }, 'Nodes fetched successfully');
    } catch (err: any) {
        logger.error('Error fetching DT nodes', { error: err.message });
        sendError(res, 'Failed to fetch nodes', 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
};

export const getRelationships = async (req: Request, res: Response) => {
    try {
        const cityId = getCityId(req);
        const { nodeId } = req.query;

        let filter: any = { cityId: new Types.ObjectId(cityId), active: true };

        if (nodeId) {
            const _nId = new Types.ObjectId(nodeId as string);
            filter = { $and: [filter, { $or: [{ sourceNodeId: _nId }, { targetNodeId: _nId }] }] };
        }

        const relationships = await DigitalTwinRelationship.find(filter)
            .populate('sourceNodeId', 'name domain status')
            .populate('targetNodeId', 'name domain status')
            .limit(500)
            .lean();

        sendSuccess(res, { relationships, count: relationships.length }, 'Relationships fetched successfully');
    } catch (err: any) {
        sendError(res, 'Failed to fetch relationships', 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
};

export const getSummary = async (req: Request, res: Response) => {
    try {
        const cityId = getCityId(req);

        const [nodeTotal, relationshipsTotal] = await Promise.all([
            DigitalTwinNode.countDocuments({ cityId: new Types.ObjectId(cityId) }),
            DigitalTwinRelationship.countDocuments({ cityId: new Types.ObjectId(cityId) })
        ]);

        sendSuccess(res, { nodes: nodeTotal, relationships: relationshipsTotal }, 'Summary loaded');
    } catch (err: any) {
        sendError(res, 'Failed to fetch summary', 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
};
