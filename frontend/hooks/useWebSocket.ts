import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
// decoupled from useAuth
import api from '../services/api';

interface WebSocketOptions {
    autoConnect?: boolean;
    token?: string;
}

export function useWebSocket(options: WebSocketOptions = { autoConnect: true }) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!options.autoConnect || !options.token) return;

        // Ensure we only have one socket connection
        if (socketRef.current) return;

        let originUrl = 'http://localhost:5000';
        try {
            const tempUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            originUrl = new URL(tempUrl).origin;
        } catch (e) {
            // fallback if URL parsing fails
        }

        const socket = io(originUrl, {
            auth: { token: options.token },
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        socket.on('error', (err: any) => {
            console.error('WebSocket error:', err);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [options.token, options.autoConnect]);

    return {
        socket: socketRef.current,
        isConnected
    };
}
