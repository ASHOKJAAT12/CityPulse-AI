'use client';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:5000';

/** Singleton socket instance */
let socket: Socket | null = null;
let connectToken: string | null = null;

/**
 * trackingSocket — Socket.IO client wrapper for Phase 5 live tracking.
 *
 * Usage:
 *   trackingSocket.connect(adminToken);
 *   trackingSocket.joinCityRoom(cityId);
 *   trackingSocket.on('garbage:vehicle-location-updated', handler);
 *   // on cleanup:
 *   trackingSocket.disconnect();
 */
const trackingSocket = {
    /**
     * Connect to the WebSocket server.
     * Passes JWT in handshake auth so the server can validate admin/citizen role.
     * @param token Admin JWT (from localStorage) or omit for unauthenticated citizen view.
     */
    connect(token?: string): Socket {
        if (socket?.connected && connectToken === (token ?? null)) {
            return socket;
        }

        if (socket) {
            socket.disconnect();
        }

        connectToken = token ?? null;
        socket = io(BACKEND_URL, {
            auth: token ? { token } : {},
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 10,
        });

        socket.on('connect', () => {
            console.debug('[TrackingSocket] Connected', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.debug('[TrackingSocket] Disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.warn('[TrackingSocket] Connection error:', err.message);
        });

        return socket;
    },

    disconnect(): void {
        socket?.disconnect();
        socket = null;
        connectToken = null;
    },

    isConnected(): boolean {
        return socket?.connected ?? false;
    },

    getSocket(): Socket | null {
        return socket;
    },

    // ── Room management ──────────────────────────────────────────

    joinCityRoom(cityId: string): void {
        socket?.emit('join:city-room', cityId);
    },

    leaveCityRoom(cityId: string): void {
        socket?.emit('leave:city-room', cityId);
    },

    joinVehicleRoom(vehicleId: string): void {
        socket?.emit('join:vehicle-room', vehicleId);
    },

    leaveVehicleRoom(vehicleId: string): void {
        socket?.emit('leave:vehicle-room', vehicleId);
    },

    joinRouteRoom(routeId: string): void {
        socket?.emit('join:route-room', routeId);
    },

    leaveRouteRoom(routeId: string): void {
        socket?.emit('leave:route-room', routeId);
    },

    // ── Event listeners ──────────────────────────────────────────

    on<T = unknown>(event: string, handler: (data: T) => void): void {
        socket?.on(event, handler);
    },

    off<T = unknown>(event: string, handler?: (data: T) => void): void {
        if (handler) {
            socket?.off(event, handler);
        } else {
            socket?.removeAllListeners(event);
        }
    },
};

export default trackingSocket;
