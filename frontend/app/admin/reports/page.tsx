'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, Filter, AlertCircle, FileText, Activity } from 'lucide-react';

export default function AdminReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        try {
            let query = '/reports/admin?limit=100';
            if (statusFilter) query += `&status=${statusFilter}`;
            if (priorityFilter) query += `&priority=${priorityFilter}`;

            const res = await api.get(query);
            setReports(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, priorityFilter]);

    const getStatusBadge = (status: string) => {
        const style: Record<string, string> = {
            'SUBMITTED': 'bg-blue-100 text-blue-800',
            'UNDER_REVIEW': 'bg-purple-100 text-purple-800',
            'VERIFIED': 'bg-indigo-100 text-indigo-800',
            'ASSIGNED': 'bg-orange-100 text-orange-800',
            'IN_PROGRESS': 'bg-amber-100 text-amber-800',
            'RESOLVED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-zinc-100 text-zinc-800',
            'REJECTED': 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${style[status] || 'bg-gray-100'}`}>{status.replace('_', ' ')}</span>;
    };

    const getPriorityBadge = (priority: string) => {
        const style: Record<string, string> = {
            'LOW': 'text-green-600',
            'MEDIUM': 'text-amber-600',
            'HIGH': 'text-orange-600 font-bold',
            'CRITICAL': 'text-red-600 font-bold'
        };
        return <span className={`text-xs ${style[priority] || ''}`}>{priority}</span>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Citizen Issue Triage</h1>
                    <p className="text-muted-foreground mt-2">Manage, assign, and verify reports incoming from the public.</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Statuses</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center border rounded-xl bg-card animate-pulse">
                    <Activity className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Issues Found</h3>
                    <p className="text-muted-foreground">Catching up with the backlog.</p>
                </div>
            ) : (
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Report ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Title & Category</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reports.map(report => (
                                    <tr key={report._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium">{report.reportNumber}</td>
                                        <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold">{report.title}</div>
                                            <div className="text-xs text-muted-foreground">{report.category}</div>
                                        </td>
                                        <td className="px-6 py-4">{getPriorityBadge(report.priority)}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => router.push(`/admin/reports/${report._id}`)}
                                                className="text-primary hover:underline font-medium text-xs"
                                            >
                                                Triage Issue
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
