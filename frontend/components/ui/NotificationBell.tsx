'use client';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRouter } from 'next/navigation';
import api from '../../services/api'; // or wherever the API instance is

interface NotificationBellProps {
    token?: string;
    isAdmin?: boolean;
}

export function NotificationBell({ token, isAdmin = false }: NotificationBellProps) {
    const defaultToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const finalToken = token || defaultToken || '';

    const { socket, isConnected } = useWebSocket({ token: finalToken, autoConnect: !!finalToken });
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Fetch existing unread count
        const fetchCount = async () => {
            try {
                // If admin, we use admin APIs. If citizen, citizen APIs.
                // Both routes were mapped internally but we use the citizen standard 'api/v1/notifications/unread-count'
                // since NotificationController supports both if token is valid.
                const res = await api.get('/notifications/unread-count', {
                    headers: finalToken ? { Authorization: `Bearer ${finalToken}` } : {}
                });
                if (res.data?.success) {
                    setUnreadCount(res.data.data.count);
                }
            } catch (error) {
                console.error("Failed to fetch unread count", error);
            }
        };

        if (finalToken) fetchCount();
    }, [finalToken]);

    useEffect(() => {
        if (!socket) return;

        socket.on('notification:created', (data) => {
            setUnreadCount(prev => prev + 1);
            // Optionally could trigger toast here
        });

        socket.on('notification:count-updated', (data) => {
            setUnreadCount(data.unread);
        });

        return () => {
            socket.off('notification:created');
            socket.off('notification:count-updated');
        };
    }, [socket]);

    const handleClick = () => {
        if (isAdmin) {
            router.push('/admin/settings'); // Admins don't have a notification center yet, but can go here or we make one
        } else {
            router.push('/app/notifications');
        }
    };

    return (
        <button
            onClick={handleClick}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
                background: '#F0F2F5',
                boxShadow: '3px 3px 7px rgba(163,177,198,0.5), -3px -3px 7px rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.7)',
            }}
            title="Notifications"
        >
            <Bell className="w-4 h-4 text-[#7B8494]" />

            {unreadCount > 0 && (
                <span
                    className="absolute -top-1 -right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: '#ef4444', boxShadow: '0 1px 4px rgba(239,68,68,0.4)' }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}

            {/* Live connection dot */}
            <span
                className={`absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-[#C8D0DF]'}`}
            />
        </button>
    );
}
