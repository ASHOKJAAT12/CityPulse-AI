'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Activity, Users, Settings, MessageSquare, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AdminReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<any[]>([]);

    // Form states
    const [status, setStatus] = useState<string>('');
    const [priority, setPriority] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [commentText, setCommentText] = useState('');
    const [internalComment, setInternalComment] = useState(false);

    const fetchDetails = async () => {
        try {
            const [res, deptRes] = await Promise.all([
                api.get(`/reports/admin/${params.id}`),
                api.get('/cities/my/departments').catch(() => ({ data: { data: [] } }))
            ]);
            setData(res.data.data);
            setStatus(res.data.data.report.status);
            setPriority(res.data.data.report.priority);
            setDepartment(res.data.data.report.department?._id || '');
            setDepartments(deptRes.data.data || []);
        } catch (error) {
            toast.error("Failed to load report");
            router.push('/admin/reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleUpdate = async () => {
        try {
            await api.patch(`/reports/admin/${params.id}`, {
                status, priority, department: department || undefined
            });
            toast.success('Report updated successfully');
            fetchDetails();
        } catch (error) {
            toast.error('Failed to update report');
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/reports/admin/${params.id}/comments`, {
                message: commentText,
                visibleToCitizen: !internalComment
            });
            setCommentText('');
            toast.success("Comment posted");
            fetchDetails();
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

    if (loading || !data) {
        return (
            <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6">
                <div className="h-10 bg-card border rounded-md w-32"></div>
                <div className="h-64 bg-card border rounded-xl"></div>
            </div>
        );
    }

    const { report, timeline, comments } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <button
                onClick={() => router.push('/admin/reports')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Triage List
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Details & Comments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card shadow-sm border rounded-xl overflow-hidden">
                        <div className="p-6 border-b bg-muted/10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono font-bold tracking-widest bg-primary/10 text-primary px-3 py-1 rounded">
                                    {report.reportNumber}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">{report.category}</span>
                            </div>
                            <h1 className="text-2xl font-bold mt-2">{report.title}</h1>
                            <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{report.description}</p>

                            <div className="mt-6 flex gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> [{report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}]</div>
                            </div>
                        </div>

                        {report.attachments?.length > 0 && (
                            <div className="p-6 border-b border-t bg-muted/10">
                                <h3 className="font-semibold text-sm mb-4">Evidence Attachments</h3>
                                <div className="flex gap-4 overflow-x-auto">
                                    {report.attachments.map((file: any, i: number) => (
                                        <a href={api.defaults.baseURL?.replace('/api/v1', '') + file.url || file.url} target="_blank" rel="noreferrer" key={i}>
                                            <Image
                                                src={api.defaults.baseURL?.replace('/api/v1', '') + file.url || file.url}
                                                alt="Attachment"
                                                width={192}
                                                height={128}
                                                className="h-32 w-48 object-cover rounded-lg border shadow-sm flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-0 flex flex-col">
                            <div className="p-4 border-b font-semibold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Correspondence Log
                            </div>
                            <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto bg-slate-50/50">
                                {comments.map((c: any) => (
                                    <div key={c._id} className={`flex flex-col max-w-[85%] rounded-lg p-3 ${c.authorRole === 'CITIZEN' ? 'bg-background border self-start rounded-tl-none' : (c.visibleToCitizen ? 'bg-primary text-primary-foreground self-end rounded-tr-none' : 'bg-amber-100 text-amber-900 self-end rounded-tr-none border border-amber-300')}`}>
                                        <div className="text-xs opacity-70 mb-1">
                                            {c.authorRole === 'CITIZEN' ? 'Citizen' : (c.authorId?.name || 'Admin')}
                                            {!c.visibleToCitizen && ' (Internal Note)'} • {new Date(c.createdAt).toLocaleTimeString()}
                                        </div>
                                        <div className="text-sm whitespace-pre-wrap">{c.message}</div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleComment} className="p-4 bg-background border-t space-y-3">
                                <textarea
                                    required
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Type a response to the citizen or an internal note..."
                                    className="w-full h-20 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                                <div className="flex justify-between items-center">
                                    <label className="flex items-center gap-2 text-sm text-amber-700 font-medium">
                                        <input type="checkbox" checked={internalComment} onChange={e => setInternalComment(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                                        Private Internal Note
                                    </label>
                                    <button type="submit" disabled={!commentText.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">
                                        {internalComment ? 'Save Note' : 'Post Reply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Timeline */}
                <div className="space-y-6">
                    <div className="bg-card shadow-sm border rounded-xl overflow-hidden p-6 z-10 sticky top-[80px]">
                        <h3 className="font-semibold flex items-center gap-2 mb-6">
                            <Settings className="w-5 h-5 text-primary" /> Management Actions
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Status Transition</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full h-10 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="SUBMITTED">Submitted</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="VERIFIED">Verified (Ready for Ops)</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed (Archived)</option>
                                    <option value="REJECTED">Rejected / Spam</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">SLA Priority</label>
                                <select
                                    value={priority}
                                    onChange={e => setPriority(e.target.value)}
                                    className="w-full h-10 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="LOW">Low (Routine)</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High (Urgent)</option>
                                    <option value="CRITICAL">Critical (Danger)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Department Assignment</label>
                                <select
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                    className="w-full h-10 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">-- Unassigned --</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                                    ))}
                                </select>
                            </div>

                            <button onClick={handleUpdate} className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md font-medium transition-colors mt-2">
                                Apply Changes
                            </button>
                        </div>
                    </div>

                    <div className="bg-card shadow-sm border rounded-xl overflow-hidden p-6">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-primary" /> Lifecycle Ledger
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {timeline.map((event: any, i: number) => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                                    <div>
                                        <div className="font-medium">{event.status.replace('_', ' ')}</div>
                                        <div className="text-muted-foreground">{event.message}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{new Date(event.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
