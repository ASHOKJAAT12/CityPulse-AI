import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env';
import logger from '../utils/logger';
import { roomName, WS_EVENTS } from '../constants/events';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.IO server and attach to the HTTP server.
 *
 * Room strategy:
 *   city:<cityId>            — all users in a city
 *   city:<cityId>:<service>  — users subscribed to a specific city service
 *   user:<userId>            — private user channel
 *
 * Auth:
 *   Phase 7+: The `authenticate` handshake middleware will verify JWT
 *   in the connection request before allowing room subscriptions.
 *   For now, connections are allowed but rooms require explicit join.
 */
export function initializeWebSocket(server: HttpServer): SocketIOServer {
    io = new SocketIOServer(server, {
        cors: {
            origin: env.FRONTEND_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Phase 7+: Add JWT authentication middleware here:
    // io.use(async (socket, next) => {
    //   const token = socket.handshake.auth.token;
    //   try {
    //     const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    //     socket.data.user = payload;
    //     next();
    //   } catch {
    //     next(new Error('Authentication failed'));
    //   }
    // });

    io.on('connection', (socket: Socket) => {
        logger.debug('WebSocket client connected', { socketId: socket.id });

        // ── Room management ───────────────────────────────────────

        socket.on(WS_EVENTS.JOIN_CITY_ROOM, (cityId: string) => {
            // Phase 7+: Verify the user has access to this city
            const room = roomName.city(cityId);
            void socket.join(room);
            logger.debug('Client joined city room', { socketId: socket.id, room });
        });

        socket.on(WS_EVENTS.LEAVE_CITY_ROOM, (cityId: string) => {
            const room = roomName.city(cityId);
            void socket.leave(room);
            logger.debug('Client left city room', { socketId: socket.id, room });
        });

        socket.on(WS_EVENTS.DISCONNECT, (reason) => {
            logger.debug('WebSocket client disconnected', { socketId: socket.id, reason });
        });

        socket.on(WS_EVENTS.ERROR, (error: Error) => {
            logger.error('WebSocket error', { socketId: socket.id, error: error.message });
        });
    });

    logger.info('✅ WebSocket server initialized');
    return io;
}

/**
 * Get the Socket.IO instance.
 * Use this in services to emit events to city rooms.
 *
 * Example (Phase 7+):
 *   getIO().to(roomName.city(cityId)).emit(WS_EVENTS.GARBAGE_VEHICLE_LOCATION_UPDATED, data);
 */
export function getIO(): SocketIOServer {
    if (!io) throw new Error('WebSocket server not initialized. Call initializeWebSocket() first.');
    return io;
}

/**
 * Emit an event to all clients in a city room.
 * Safe to call from any service — no direct socket imports needed.
 */
export function emitToCityRoom(cityId: string, event: string, data: unknown): void {
    if (!io) {
        logger.warn('Attempted to emit to city room before WebSocket initialization');
        return;
    }
    io.to(roomName.city(cityId)).emit(event, data);
}
