export function cn(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(' ');
}

export function formatMoney(value: unknown): string {
    const amount = typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatSequence(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return `#${String(n).padStart(6, '0')}`;
}

export function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

const statusColors: Record<string, string> = {
    // positive
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    successful: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    eligible: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    approved: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    held: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    consumed: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    released: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    credit: 'text-emerald-600',
    debit: 'text-rose-600',
    // neutral / pending
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    eligible_pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    // negative
    failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    blocked: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    cancelled: 'bg-gray-100 text-gray-500 ring-gray-500/20',
    reversed: 'bg-purple-50 text-purple-700 ring-purple-600/20',
};

export function statusColor(status: string): string {
    return statusColors[status] ?? 'bg-gray-100 text-gray-600 ring-gray-500/20';
}

export function humanizeType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
