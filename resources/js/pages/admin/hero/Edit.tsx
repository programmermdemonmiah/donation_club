import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import type { PageProps } from '@/types';

interface HeroProps {
    title: string;
    description: string;
    media: Array<{ url: string; type: string }>;
    limits?: { photo_mb: number; video_mb: number };
}

export default function HeroEdit() {
    const page = usePage<PageProps & { hero: HeroProps }>();
    const { hero } = page.props;
    const errors = (page.props.errors || {}) as Record<string, string>;
    
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const submitText = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.append('_method', 'PUT');
        router.post(route('admin.hero.update'), fd, { preserveScroll: true });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fd = new FormData();
        fd.append('media', file);

        router.post(route('admin.hero.images.store'), fd, {
            preserveScroll: true,
            onFinish: () => {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const deleteImage = (index: number) => {
        if (!confirm('Remove this from the gallery?')) return;
        
        router.delete(route('admin.hero.images.destroy'), {
            data: { index },
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Hero Section</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage the homepage title and description. Photos and videos uploaded here appear on the public Gallery page.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Text Content */}
                <Card>
                    <CardHeader title="Hero Content" subtitle="The main headline and subtext displayed on the homepage" />
                    <CardBody>
                        <form onSubmit={submitText} className="space-y-4">
                            <Input 
                                label="Main Title" 
                                name="title" 
                                defaultValue={hero.title} 
                                required 
                                placeholder="Donate Together. Grow Together."
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}

                            <Textarea 
                                label="Description" 
                                name="description" 
                                rows={4} 
                                defaultValue={hero.description} 
                                required 
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}

                            <div className="flex justify-end pt-2">
                                <Button type="submit">Save Content</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>

                {/* Images Gallery */}
                <Card>
                    <CardHeader title="Gallery" subtitle="Photos and videos shown when someone opens Gallery in the site header. These are not used as the homepage background." />
                    <CardBody>
                        {/* Uploader */}
                        <div className="mb-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov"
                                className="hidden"
                                id="hero-image-upload"
                                disabled={uploading}
                            />
                            <label 
                                htmlFor="hero-image-upload"
                                className={`cursor-pointer inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? 'Uploading...' : 'Upload photo or video'}
                            </label>
                            <p className="mt-2 text-xs text-gray-500">
                                Photos: JPG, PNG, WebP (max {hero.limits?.photo_mb ?? 10}MB). Videos: MP4, WebM, MOV (max {hero.limits?.video_mb ?? 10}MB).
                            </p>
                            {errors.media && <p className="mt-2 text-xs font-semibold text-red-600">{errors.media}</p>}
                        </div>

                        {/* Gallery */}
                        {hero.media.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {hero.media.map((item, idx) => (
                                    <div key={`${item.url}-${idx}`} className="group relative aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                        {item.type === 'video' ? (
                                            <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                                        ) : (
                                            <img src={item.url} alt={`Gallery item ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        )}
                                        <span className="absolute left-2 top-2 rounded-md bg-gray-900/75 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                            {item.type === 'video' ? 'Video' : 'Photo'}
                                        </span>
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                            <button 
                                                onClick={() => deleteImage(idx)}
                                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-500"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-32 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                                <p className="text-sm text-gray-400">No photos or videos yet.</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
}
