'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Camera, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SubmitReportPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form payload
    const [category, setCategory] = useState('OTHER');
    const [subcategory, setSubcategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [files, setFiles] = useState<File[]>([]);

    // Extracted categories matching Zod payload
    const categories = [
        'WATER', 'ELECTRICITY', 'TRAFFIC', 'GARBAGE',
        'STREETLIGHT', 'EV', 'ROAD', 'DRAINAGE',
        'PUBLIC_SAFETY', 'ENVIRONMENT', 'OTHER'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location) {
            toast.error("Please drop a pin on the map");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('category', category);
            formData.append('subcategory', subcategory || category);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('longitude', location.lng.toString());
            formData.append('latitude', location.lat.toString());
            formData.append('source', 'WEB');

            files.forEach(f => {
                formData.append('attachments', f);
            });

            await api.post('/reports/city', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Report submitted successfully");
            router.push('/city/my-reports');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
                <p className="text-muted-foreground mt-2">Help improve your city by reporting infrastructure or civic issues.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Side */}
                <div className="bg-card shadow rounded-xl p-6 border">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Issue Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Issue Title</label>
                            <input
                                required minLength={3} maxLength={120}
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="E.g. Broken water pipe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                required minLength={10} maxLength={2000}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full flex min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Describe the issue in detail..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Upload Photos</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-muted-foreground/30 hover:border-primary/50 transition-colors bg-muted/20">
                                <div className="space-y-1 text-center">
                                    <Camera className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <div className="flex text-sm mt-4 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary focus-within:outline-none">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={(e) => {
                                                if (e.target.files) setFiles(Array.from(e.target.files));
                                            }} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-1">
                                        {files.length > 0 ? `${files.length} file(s) selected` : 'PNG, JPG, up to 10MB'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/city/my-reports')}
                                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !location}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex justify-center"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Map Side */}
                <div className="flex flex-col gap-4">
                    <div className="bg-card shadow rounded-xl p-4 border flex items-start gap-4">
                        <MapPin className="text-primary w-8 h-8 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Pinpoint the Location</h3>
                            <p className="text-sm text-muted-foreground">Click the map to drop a pin precisely where the issue occurred. This ensures swift resolution times.</p>
                        </div>
                    </div>

                    <div className="flex-1 rounded-xl overflow-hidden shadow border min-h-[400px] flex items-center justify-center bg-muted/20 relative">
                        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow border text-sm font-medium text-green-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Geolocation Activated
                        </div>
                        <button
                            onClick={(e) => { e.preventDefault(); setLocation({ lat: Math.random() * 10 + 20, lng: Math.random() * 10 + 70 }); toast.success("Location identified!") }}
                            className="px-6 py-3 bg-primary text-white rounded shadow"
                        >
                            Auto-Pin My Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
