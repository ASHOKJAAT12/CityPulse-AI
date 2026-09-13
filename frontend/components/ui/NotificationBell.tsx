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
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
            <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />

            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}

            {/* Status Indicator */}
            <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </button>
    );
}
