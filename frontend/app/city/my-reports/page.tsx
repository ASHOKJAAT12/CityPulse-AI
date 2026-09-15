'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { FileText, MapPin, AlertCircle, Clock, ChevronRight, Activity } from 'lucide-react';

export default function MyReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports/city/my');
                setReports(res.data.data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const getStatusColor = (status: string) => {
        const map: any = {
            'SUBMITTED': 'bg-blue-100 text-blue-800 border-blue-200',
            'UNDER_REVIEW': 'bg-purple-100 text-purple-800 border-purple-200',
            'VERIFIED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'ASSIGNED': 'bg-orange-100 text-orange-800 border-orange-200',
            'IN_PROGRESS': 'bg-amber-100 text-amber-800 border-amber-200',
            'RESOLVED': 'bg-green-100 text-green-800 border-green-200',
            'CLOSED': 'bg-zinc-100 text-zinc-800 border-zinc-200',
            'REJECTED': 'bg-red-100 text-red-800 border-red-200'
        };
        return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Incident History</h1>
                    <p className="text-muted-foreground mt-2">Track the live resolution status of all civic complaints you submitted.</p>
                </div>
                <button
                    onClick={() => router.push('/city/report')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                >
                    <AlertCircle className="w-4 h-4" />
                    New Report
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-card h-48 rounded-xl border"></div>
                    ))}
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Reports Made</h3>
                    <p className="text-muted-foreground">You have not reported any civic issues yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <div
                            key={report._id}
                            onClick={() => router.push(`/city/report/${report._id}`)}
                            className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="p-5 border-b bg-muted/10 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-mono font-medium text-muted-foreground tracking-wider flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5" />
                                        {report.reportNumber}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                                        {report.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{report.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                            </div>

                            <div className="p-4 bg-background flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                    <span className="truncate">{report.category} Incident</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-xs font-medium text-indigo-600 group-hover:underline">
                                        View Track <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
