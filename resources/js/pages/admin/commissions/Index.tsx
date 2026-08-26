import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface CommissionRow {
    id: number;
    reference: string;
    user?: { id: number; name: string; email: string } | null;
    from_user?: { id: number; name: string; email: string } | null;
    generation: number;
    rate: string;
    base_amount: string;
    amount: string;
    status: string;
    credited_at: string | null;
}

export default function AdminCommissions() {
    const page = usePage<PageProps & { commissions: { data: CommissionRow[]; current_page: number; last_page: number }; filters: { status?: string; generation?: string } }>();

    const setFilter = (key: 'status' | 'generation', value: string) => {
        const current = page.props.filters ?? {};
        router.get(route('admin.commissions.index'), { ...current, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Commissions</h1>

            <div className="mt-4 flex gap-3">
                <div className="w-40">
                    <Select value={page.props.filters?.status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
                        <option value="">All statuses</option>
                        {['completed', 'pending', 'cancelled', 'reversed'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </Select>
                </div>
                <div className="w-40">
                    <Select value={page.props.filters?.generation ?? ''} onChange={(e) => setFilter('generation', e.target.value)}>
                        <option value="">All generations</option>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
                            <option key={g} value={g}>{g === 1 ? 'Direct (1)' : `Gen ${g}`}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<CommissionRow>
                    columns={[
                        { header: 'Reference', render: (c) => <span className="font-mono text-xs">{c.reference}</span> },
                        {
                            header: 'Beneficiary',
                            render: (c) =>
                                c.user ? (
                                    <a href={route('admin.users.show', c.user.id)} className="text-indigo-600 hover:text-indigo-500">{c.user.name}</a>
                                ) : '—',
                        },
                        { header: 'Source member', render: (c) => c.from_user?.name ?? '—' },
                        { header: 'Gen', render: (c) => (c.generation === 1 ? 'Direct' : c.generation) },
                        { header: 'Rate', render: (c) => `${Number(c.rate)}%` },
                        { header: 'Base', render: (c) => formatMoney(c.base_amount) },
                        { header: 'Amount', render: (c) => <strong>{formatMoney(c.amount)}</strong> },
                        { header: 'Status', render: (c) => <Badge value={c.status} /> },
                        { header: 'Credited', render: (c) => formatDateTime(c.credited_at) },
                    ]}
                    rows={page.props.commissions.data}
                    rowKey={(c) => c.id}
                    emptyMessage="No commissions found."
                />
                <Pagination currentPage={page.props.commissions.current_page} lastPage={page.props.commissions.last_page} />
            </div>
        </AdminLayout>
    );
}
