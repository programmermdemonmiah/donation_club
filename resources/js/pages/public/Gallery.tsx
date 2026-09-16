import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface GalleryItem {
    url: string;
    type: string;
}

type Filter = 'all' | 'image' | 'video';

export default function Gallery() {
    const { media = [] } = usePage<{ media: GalleryItem[] }>().props;
    const [filter, setFilter] = useState<Filter>('all');
    const [active, setActive] = useState<number | null>(null);

    const visible = useMemo(
        () => media.filter((item) => filter === 'all' || item.type === filter),
        [media, filter],
    );

    const photoCount = media.filter((item) => item.type === 'image').length;
    const videoCount = media.filter((item) => item.type === 'video').length;
    const current = active === null ? null : visible[active] ?? null;

    useEffect(() => {
        if (active === null) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActive(null);
            }
            if (event.key === 'ArrowRight') {
                setActive((index) => (index === null ? null : Math.min(index + 1, visible.length - 1)));
            }
            if (event.key === 'ArrowLeft') {
                setActive((index) => (index === null ? null : Math.max(index - 1, 0)));
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [active, visible.length]);

    const openFilter = (next: Filter) => {
        setFilter(next);
        setActive(null);
    };

    const filters: Array<{ id: Filter; label: string; count: number }> = [
        { id: 'all', label: 'All', count: media.length },
        { id: 'image', label: 'Photos', count: photoCount },
        { id: 'video', label: 'Videos', count: videoCount },
    ];

    return (
        <PublicLayout title="Gallery">
            <section className="relative overflow-hidden bg-blue-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950"></div>
                <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>

                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">Media</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Gallery</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400">
                        Photos and videos from Donation Club. Open any item to view it full size.
                    </p>
                </div>
            </section>

            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-black uppercase tracking-widest text-blue-600">Browse</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Photos & videos</h2>
                        </div>
                        <div className="inline-flex rounded-xl border border-gray-100 bg-gray-50 p-1 shadow-sm">
                            {filters.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => openFilter(item.id)}
                                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                                        filter === item.id
                                            ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,.25)]'
                                            : 'text-gray-600 hover:text-blue-600'
                                    }`}
                                >
                                    {item.label}
                                    <span className={`ml-1.5 text-xs ${filter === item.id ? 'text-white/70' : 'text-gray-400'}`}>{item.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {visible.length > 0 ? (
                        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {visible.map((item, index) => (
                                <button
                                    key={`${item.url}-${index}`}
                                    type="button"
                                    onClick={() => setActive(index)}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-lg shadow-gray-200/40 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                    aria-label={item.type === 'video' ? `Play video ${index + 1}` : `View photo ${index + 1}`}
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        {item.type === 'video' ? (
                                            <video src={item.url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" muted playsInline preload="metadata" />
                                        ) : (
                                            <img src={item.url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        )}
                                        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-blue-950/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                            {item.type === 'video' ? 'Video' : 'Photo'}
                                        </span>
                                        <span className="absolute inset-0 flex items-center justify-center bg-blue-950/0 transition-colors duration-300 group-hover:bg-blue-950/35">
                                            <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white text-blue-600 opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                                                {item.type === 'video' ? (
                                                    <svg className="ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path d="M6.3 4.8a1 1 0 011.5-.86l7.2 4.2a1 1 0 010 1.72l-7.2 4.2A1 1 0 016.3 13.2V4.8z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                )}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <p className="text-sm font-bold text-gray-900">{item.type === 'video' ? 'Play video' : 'View photo'}</p>
                                        <span className="text-xs font-black text-blue-600">{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-lg shadow-gray-200/40">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
                                <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                                </svg>
                            </div>
                            <p className="mt-5 text-xl font-black text-gray-900">Nothing here yet</p>
                            <p className="mx-auto mt-2 max-w-md text-base font-medium text-gray-600">
                                {filter === 'video' ? 'No videos have been added.' : filter === 'image' ? 'No photos have been added.' : 'Photos and videos will appear here once they are added.'}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {current && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-blue-950/90 p-4 sm:p-8"
                    role="dialog"
                    aria-modal="true"
                    aria-label={current.type === 'video' ? 'Video' : 'Photo'}
                    onClick={() => setActive(null)}
                >
                    <button
                        type="button"
                        onClick={() => setActive(null)}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {visible.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setActive((index) => (index === null ? null : Math.max(index - 1, 0)));
                                }}
                                disabled={active === 0}
                                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                                aria-label="Previous"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setActive((index) => (index === null ? null : Math.min(index + 1, visible.length - 1)));
                                }}
                                disabled={active === visible.length - 1}
                                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                                aria-label="Next"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                            {current.type === 'video' ? (
                                <video key={current.url} src={current.url} className="max-h-[78vh] w-full bg-black" controls autoPlay playsInline />
                            ) : (
                                <img src={current.url} alt="Gallery photo" className="max-h-[78vh] w-full object-contain" />
                            )}
                        </div>
                        <p className="mt-4 text-center text-sm font-bold text-white/80">
                            {(active ?? 0) + 1} / {visible.length}
                        </p>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
