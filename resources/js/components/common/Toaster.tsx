import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { PageProps } from '@/types';
import { cn } from '@/utils/format';

interface ToastItem {
    id: number;
    kind: 'success' | 'error' | 'info';
    text: string;
}

export function useToasts(): ToastItem[] {
    const page = usePage<PageProps>();
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    let counter = useRef(0).current;

    useEffect(() => {
        const flash = page.props.flash ?? {};
        const incoming: Array<{ kind: ToastItem['kind']; text: string }> = [];

        if (flash.success) incoming.push({ kind: 'success', text: flash.success });
        if (flash.error) incoming.push({ kind: 'error', text: flash.error });
        if (page.props.errors && Object.values(page.props.errors as Record<string, string>).length > 0) {
            const first = Object.values(page.props.errors as Record<string, string>)[0];
            incoming.push({ kind: 'error', text: first });
        }

        if (incoming.length === 0) return;

        const items = incoming.map((i) => ({ id: ++counter, ...i }));
        setToasts((prev) => [...prev, ...items]);

        const timers = items.map((item) =>
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== item.id)), 5000),
        );

        return () => timers.forEach(clearTimeout);
    }, [page.props.flash, page.props.errors]);

    return toasts;
}

export default function Toaster() {
    const toasts = useToasts();

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        'pointer-events-auto flex items-start gap-3 rounded-lg p-4 shadow-lg ring-1 ring-inset animate-fade-in',
                        toast.kind === 'success'
                            ? 'bg-emerald-50 ring-emerald-600/20'
                            : toast.kind === 'error'
                              ? 'bg-rose-50 ring-rose-600/20'
                              : 'bg-sky-50 ring-sky-600/20',
                    )}
                >
                    <span className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', toast.kind === 'success' ? 'bg-emerald-500' : toast.kind === 'error' ? 'bg-rose-500' : 'bg-sky-500')} />
                    <p className={cn('text-sm', toast.kind === 'success' ? 'text-emerald-800' : toast.kind === 'error' ? 'text-rose-800' : 'text-sky-800')}>
                        {toast.text}
                    </p>
                </div>
            ))}
        </div>
    );
}
