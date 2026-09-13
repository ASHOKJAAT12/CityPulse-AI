'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Wrench, CheckCircle } from 'lucide-react';
import api from '../../../../services/api';

export default function ElectricityMaintenancePage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/electricity/maintenance/admin')
            .then((res: any) => setTasks(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleComplete = async (id: string) => {
        if (!confirm('Mark this maintenance as COMPLETED?')) return;
        try {
            await api.patch(`/admin/electricity/maintenance/${id}`, { status: 'COMPLETED' });
            setTasks(tasks.map(t => t._id === id ? { ...t, status: 'COMPLETED' } : t));
        } catch (error) {
            console.error('Failed to complete maintenance', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Grid Maintenance</h1>
                    <p className="text-slate-500">Schedule preventive and corrective tasks for electrical assets.</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search pending tasks..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Task Title</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Start Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading maintenance...</td></tr>
                            ) : tasks.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pending maintenance jobs.</td></tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <Wrench className="w-4 h-4" />
                                                </div>
                                                {task.title}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1 ml-11 line-clamp-1">{task.description}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{task.type}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(task.scheduledStart).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${task.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700' :
                                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                            'bg-slate-100 text-slate-700'}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => handleComplete(task._id)}
                                                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium transition-colors w-full text-left flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> Mark Completed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
