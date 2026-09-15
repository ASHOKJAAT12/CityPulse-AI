'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { ArrowLeft, Activity, Users, Settings, MessageSquare, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/reports/city/${params.id}`);
            setData(res.data.data);
        } catch (error) {
            toast.error("Failed to load report");
            router.push('/city/my-reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/reports/city/${params.id}/comments`, { message: commentText });
            setCommentText('');
            toast.success("Comment posted");
            fetchDetails(); // Reload to get fresh comment
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto animate-pulse space-y-6">
                <div className="h-10 bg-card rounded w-32"></div>
                <div className="h-64 bg-card rounded-xl"></div>
            </div>
        );
    }

    if (!data) return null;

    const { report, timeline, comments } = data;

    const getStatusStyle = (status: string) => {
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
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <button
                onClick={() => router.push('/city/my-reports')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to My Reports
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card shadow-sm border rounded-xl overflow-hidden">
                        <div className="p-6 border-b bg-muted/10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-background border rounded-md text-sm font-mono tracking-wider font-semibold">
                                        {report.reportNumber}
                                    </span>
                                    <span className={`px-3 py-1 rounded-md text-sm font-semibold border ${getStatusStyle(report.status)}`}>
                                        {report.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{report.category} Incident</div>
                                    {new Date(report.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold mb-3">{report.title}</h1>
                            <p className="text-muted-foreground whitespace-pre-wrap">{report.description}</p>
                        </div>

                        {/* Attachments */}
                        {report.attachments && report.attachments.length > 0 && (
                            <div className="p-6 bg-background space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Evidence Attached
                                </h3>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {report.attachments.map((file: any, i: number) => (
                                        <a
                                            key={i}
                                            href={api.defaults.baseURL?.replace('/api/v1', '') + file.url || file.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img
                                                src={api.defaults.baseURL?.replace('/api/v1', '') + file.url || file.url}
                                                alt="Attachment"
                                                className="h-32 w-48 object-cover rounded-lg border shadow-sm flex-shrink-0"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-6 bg-muted/5 flex items-center gap-4 text-sm border-t">
                            <MapPin className="text-indigo-600 w-5 h-5 flex-shrink-0" />
                            <div>
                                <span className="font-medium block">Geospatial Marker Pinged</span>
                                <span className="text-muted-foreground">Coordinates: [{report.location.coordinates[1].toFixed(5)}, {report.location.coordinates[0].toFixed(5)}]</span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-card shadow-sm border rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-muted/10 font-semibold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Correspondence Log
                        </div>

                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
                            {comments.length === 0 ? (
                                <div className="text-sm text-center text-muted-foreground py-8">No comments yet. Administrative updates will appear here.</div>
                            ) : (
                                comments.map((c: any) => (
                                    <div key={c._id} className={`flex flex-col max-w-[85%] rounded-lg p-3 ${c.authorRole === 'CITIZEN' ? 'bg-indigo-600 text-white self-end rounded-tr-none' : 'bg-background border shadow-sm self-start rounded-tl-none'}`}>
                                        <div className="text-xs opacity-70 mb-1 flex items-center gap-1.5">
                                            {c.authorRole !== 'CITIZEN' && <Settings className="w-3.5 h-3.5" />}
                                            {c.authorRole === 'CITIZEN' ? 'You' : 'City Administrator'} • {new Date(c.createdAt).toLocaleTimeString()}
                                        </div>
                                        <div className="text-sm whitespace-pre-wrap">{c.message}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* New Comment Input */}
                        {!['CLOSED', 'REJECTED'].includes(report.status) && (
                            <form onSubmit={handleComment} className="p-4 bg-background border-t">
                                <textarea
                                    required
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Type a follow-up inquiry or provide more details..."
                                    className="w-full flex min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none mb-3"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
                                    >
                                        Post Reply
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sidebar Timeline */}
                <div className="space-y-6">
                    <div className="bg-card shadow-sm border rounded-xl overflow-hidden p-6 sticky top-24">
                        <h3 className="font-semibold flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-indigo-600" /> Resolution Journey
                        </h3>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                            {timeline.map((event: any, idx: number) => (
                                <div key={idx} className="relative flex items-center justify-between group is-active">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-primary text-primary-foreground shrink-0 shadow absolute left-2 z-10">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                    <div className="w-[calc(100%-3rem)] ml-14 p-3 rounded-lg border bg-background shadow-sm hover:border-primary/50 transition-colors">
                                        <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">{event.status.replace('_', ' ')}</div>
                                        <div className="text-sm text-foreground mb-2 leading-relaxed">{event.message}</div>
                                        <div className="text-[10px] items-center gap-1 flex text-muted-foreground font-medium">
                                            <Activity className="w-3 h-3" /> {new Date(event.createdAt).toLocaleString()}
                                        </div>
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
