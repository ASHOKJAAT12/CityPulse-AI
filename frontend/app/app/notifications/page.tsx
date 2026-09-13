'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../services/api';
import { Bell, Check, Archive, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWebSocket } from '../../../hooks/useWebSocket';

interface Notification {
    _id: string;
    title: string;
    message: string;
    category: string;
    priority: string;
    status: 'UNREAD' | 'READ' | 'ARCHIVED';
    createdAt: string;
}

export default function NotificationsPage() {
    const { accessToken } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Listen for new notifications
    const { socket } = useWebSocket({ token: accessToken || undefined, autoConnect: !!accessToken });

    useEffect(() => {
        if (!accessToken) return;
        fetchNotifications(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    useEffect(() => {
        if (!socket) return;

        socket.on('notification:created', (data: Notification) => {
            // Prepend new notification to current list
            setNotifications(prev => [data, ...prev]);
        });

        return () => {
            socket.off('notification:created');
        };
    }, [socket]);

    const fetchNotifications = async (targetPage: number) => {
        try {
            setLoading(true);
            const res = await api.get(`/notifications?page=${targetPage}&limit=20`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.data?.success) {
                setNotifications(res.data.data.notifications);
                setTotalPages(res.data.data.pagination.pages);
                setPage(targetPage);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string, currentStatus: string) => {
        if (currentStatus !== 'UNREAD') return;
        try {
            await api.patch(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'READ' } : n));
        } catch (error) {
            toast.error('Failed to update notification');
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to update notifications');
        }
    };

    const archiveNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.post(`/notifications/${id}/archive`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Notification archived');
        } catch (error) {
            toast.error('Failed to archive');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Bell className="w-6 h-6 mr-3 text-indigo-600" />
                    Notification Center
                </h1>

                <button
                    onClick={markAllRead}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg flex items-center transition-colors"
                >
                    <Check className="w-4 h-4 mr-2" />
                    Mark all as read
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-700">You&apos;re all caught up!</h3>
                        <p className="text-slate-500 mt-2">There are no new notifications to display right now.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => markAsRead(notif._id, notif.status)}
                                className={`p-5 flex items-start transition-colors cursor-pointer group hover:bg-slate-50 ${notif.status === 'UNREAD' ? 'bg-indigo-50/30' : 'bg-white'}`}
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 mr-4 flex-shrink-0 ${notif.status === 'UNREAD' ? 'bg-indigo-500' : 'bg-transparent'}`} />

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-base font-semibold truncate pr-4 ${notif.status === 'UNREAD' ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-xs font-medium text-slate-400 flex flex-shrink-0 items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm mb-3 line-clamp-2 ${notif.status === 'UNREAD' ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                        {notif.message}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide ${notif.priority === 'CRITICAL' || notif.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                                            notif.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {notif.category}
                                        </span>

                                        <button
                                            onClick={(e) => archiveNotification(notif._id, e)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1"
                                            title="Archive"
                                        >
                                            <Archive className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => fetchNotifications(page - 1)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        disabled={page === totalPages}
                        onClick={() => fetchNotifications(page + 1)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
