'use client';
import { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin } from 'lucide-react';
import api from '../../../../services/api';

export default function WaterSchedulesPage() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        api.get('/admin/water/schedules')
            .then((res: any) => setSchedules(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium">Loading supply schedules...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Supply Schedules</h1>
                    <p className="text-slate-500 mt-1">Manage public water provisioning times across city zones.</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Schedule
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-emerald-200" />
                        <h3 className="text-lg font-bold text-slate-700">No schedules configured</h3>
                        <p className="mt-1">Add your first supply schedule to notify citizens.</p>
                    </div>
                ) : (
                    schedules.map((schedule) => (
                        <div key={schedule._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                                        {dayNames[schedule.dayOfWeek].substring(0, 3)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">{dayNames[schedule.dayOfWeek]}</h3>
                                        <p className="text-sm font-medium text-emerald-600 mt-0.5">{schedule.startTime} - {schedule.endTime}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${schedule.status === 'SCHEDULED' ? 'bg-slate-100 text-slate-600' :
                                    schedule.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {schedule.status}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-sm font-bold text-slate-800 mb-1">{schedule.areaName}</h4>
                                <div className="flex items-start gap-1.5 text-xs text-slate-500">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    <span>{schedule.notes || 'Routine water supply'}</span>
                                </div>
                            </div>

                            <div className="mt-5 flex gap-2">
                                <button className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded flex justify-center items-center gap-1.5 transition-colors border border-slate-200">
                                    Edit
                                </button>
                                {schedule.status === 'SCHEDULED' && (
                                    <button className="flex-1 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded flex justify-center items-center gap-1.5 transition-colors border border-blue-200">
                                        Start Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
