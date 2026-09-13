'use client';

import { useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Send, AlertTriangle, AlertCircle, Info, FileText } from 'lucide-react';

export default function AdminAnnouncementsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('SYSTEM');
    const [priority, setPriority] = useState('INFO');
    const [loading, setLoading] = useState(false);

    const categories = ['WATER', 'ELECTRICITY', 'TRAFFIC', 'EV', 'STREETLIGHT', 'GARBAGE', 'CITIZEN_REPORT', 'SYSTEM', 'MAINTENANCE', 'SECURITY'];
    const priorities = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/notifications/announcements', {
                title,
                message,
                category,
                priority,
            });
            toast.success('Announcement dispatched to all citizens!');
            setTitle('');
            setMessage('');
        } catch (error) {
            toast.error('Failed to dispatch announcement');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Send className="w-6 h-6 mr-3 text-indigo-600" />
                Dispatch City Announcement
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 text-sm text-slate-600 flex items-start">
                    <Info className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                    <p>
                        Announcements sent from this console will be delivered in real-time to all users in your assigned city via the Web Client Notifications Center. Push/SMS delivery rules depend on the priority and user preferences.
                    </p>
                </div>

                <form onSubmit={handleSend} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Priority Level</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {priorities.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">Headline / Title</label>
                        <input
                            type="text"
                            required
                            maxLength={100}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                            placeholder="E.g., Planned Water Outage in Downtown"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 block">Announcement Message</label>
                        <textarea
                            required
                            rows={4}
                            maxLength={500}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400 resize-none"
                            placeholder="Provide details about the announcement..."
                        />
                        <div className="text-right text-xs text-slate-400">
                            {message.length} / 500
                        </div>
                    </div>

                    {priority === 'CRITICAL' && (
                        <div className="bg-rose-50 text-rose-700 p-4 rounded-lg flex text-sm">
                            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                            CRITICAL priority notifications will override user mute preferences and appear immediately with high visibility. Use only for emergencies.
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !title || !message}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="animate-pulse">Dispatching...</span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Dispatch Announcement
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
