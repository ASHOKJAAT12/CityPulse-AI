'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Camera, MapPin, Crosshair, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// LocationPickerMap must be loaded client-side only (Leaflet needs window)
const LocationPickerMap = dynamic(
    () => import('@/components/map/LocationPickerMap').then(m => m.LocationPickerMap),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-muted/20 text-sm text-muted-foreground">
                Loading map…
            </div>
        )
    }
);

export default function SubmitReportPage() {
    const router = useRouter();
    const { currentCity, user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);
    const [locating, setLocating] = useState(false);

    // Form state
    const [category, setCategory] = useState('OTHER');
    const [subcategory, setSubcategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [files, setFiles] = useState<File[]>([]);

    const categories = [
        'WATER', 'ELECTRICITY', 'TRAFFIC', 'GARBAGE',
        'STREETLIGHT', 'EV', 'ROAD', 'DRAINAGE',
        'PUBLIC_SAFETY', 'ENVIRONMENT', 'OTHER'
    ];

    // Default map center: city center or Udaipur fallback
    const defaultCenter = currentCity
        ? { lat: currentCity.latitude, lng: currentCity.longitude }
        : { lat: 24.5854, lng: 73.7125 };

    const handleAutoLocate = () => {
        if (!('geolocation' in navigator)) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                toast.success('Location pinned! Verify on the map and adjust if needed.');
                setLocating(false);
            },
            () => {
                toast.error('Could not get GPS location. Click on the map to pin manually.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location) {
            toast.error('Please pin the location on the map');
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
            files.forEach(f => formData.append('attachments', f));

            await api.post('/reports/city', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Report submitted successfully');
            router.push('/city/my-reports');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    const compressImageForAnalysis = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(file);

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (!blob) return resolve(file);
                    resolve(new File([blob], "ai_compressed.jpg", { type: "image/jpeg" }));
                }, "image/jpeg", 0.7);
            };
            img.onerror = () => resolve(file);
        });
    };

    const handleAnalyzeImage = async () => {
        if (files.length === 0) {
            toast.error('Please upload an image first');
            return;
        }
        setAnalyzingImage(true);
        try {
            toast.loading("Compressing & Analyzing... this takes a few seconds.", { id: 'ai-toast' });
            const compressedFile = await compressImageForAnalysis(files[0]);

            const formData = new FormData();
            formData.append('image', compressedFile);

            const res = await api.post('/reports/city/analyze-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.dismiss('ai-toast');

            if (res.data?.data) {
                const aiData = res.data.data;
                setTitle(aiData.title);
                setDescription(aiData.description);
                const aiCatNormalized = aiData.category.toUpperCase().replace(/\s/g, '_');
                if (categories.includes(aiCatNormalized)) {
                    setCategory(aiCatNormalized);
                }
                toast.success('AI auto-filled the form!');
            }
        } catch (error: any) {
            toast.dismiss('ai-toast');
            toast.error(error.response?.data?.message || 'Failed to analyze image');
        } finally {
            setAnalyzingImage(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
                <p className="text-muted-foreground mt-2">
                    Help improve your city by reporting infrastructure or civic issues.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Form Side ── */}
                <div className="bg-card shadow rounded-xl p-6 border">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Issue Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full flex h-10 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                placeholder="E.g. Broken water pipe on Main Street"
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

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Upload Photos</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-muted-foreground/30 hover:border-primary/50 transition-colors bg-muted/20">
                                <div className="space-y-1 text-center">
                                    <Camera className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <div className="flex text-sm mt-4 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                multiple
                                                accept="image/*"
                                                onChange={e => {
                                                    if (e.target.files) setFiles(Array.from(e.target.files));
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-1">
                                        {files.length > 0 ? `${files.length} file(s) selected` : 'PNG, JPG, up to 10MB'}
                                    </p>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleAnalyzeImage}
                                    disabled={analyzingImage}
                                    className="mt-2 w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-md font-medium shadow flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {analyzingImage ? 'Analyzing Image...' : 'Auto-Fill with AI ✨'}
                                </button>
                            )}
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !location}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Map Side ── */}
                <div className="flex flex-col gap-3">
                    <div className="bg-card shadow rounded-xl p-4 border flex items-start gap-3">
                        <MapPin className="text-primary w-7 h-7 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold">Pinpoint the Location</h3>
                            <p className="text-sm text-muted-foreground">
                                <strong>Click anywhere on the map</strong> to drop a pin exactly where the issue is, or use Auto-Pin to detect your current GPS position.
                            </p>
                        </div>
                    </div>

                    {/* Real interactive Leaflet map */}
                    <div className="flex-1 rounded-xl overflow-hidden shadow border min-h-[400px] relative">
                        <LocationPickerMap
                            value={location}
                            onChange={setLocation}
                            defaultCenter={defaultCenter}
                        />

                        {/* Auto-locate button — floats over the map */}
                        <button
                            type="button"
                            onClick={handleAutoLocate}
                            disabled={locating}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-full shadow-lg transition-colors whitespace-nowrap"
                        >
                            <Crosshair className="w-4 h-4" />
                            {locating ? 'Detecting GPS…' : 'Auto-Pin My Location'}
                        </button>
                    </div>

                    {/* Live coordinate feedback */}
                    {location ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-800 flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>
                                Pin: <strong>{location.lat.toFixed(5)}</strong>, <strong>{location.lng.toFixed(5)}</strong>
                                {' '}— click the map to reposition.
                            </span>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800 flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>No location set — click the map or use Auto-Pin.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
