import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { StatCard } from '@/components/ui/StatCard';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface CommissionRow {
    id: number;
    reference: string;
    generation: number;
    rate: string;
    base_amount: string;
    amount: string;
    status: string;
    from_user?: { name: string } | null;
    credited_at: string | null;
}

export default function Commissions() {
    const page = usePage<
        PageProps & {
            totals: { completed: string; all_time: string };
            byGeneration: Record<string, string>;
            commissions: { data: CommissionRow[]; current_page: number; last_page: number };
        }
    >();

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Commissions</h1>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Earned" value={formatMoney(page.props.totals.completed)} accent="text-emerald-600" />
                <StatCard label="All Time (incl. reversed)" value={formatMoney(page.props.totals.all_time)} />
                {Object.entries(page.props.byGeneration).slice(0, 2).map(([gen, total]) => (
                    <StatCard key={gen} label={Number(gen) === 1 ? 'Direct' : `Gen ${gen}`} value={formatMoney(total)} />
                ))}
            </dl>

            <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<CommissionRow>
                    columns={[
                        { header: 'Reference', render: (c) => <span className="font-mono text-xs">{c.reference}</span> },
                        { header: 'From', render: (c) => c.from_user?.name ?? '—' },
                        { header: 'Generation', render: (c) => (c.generation === 1 ? 'Direct' : `Gen ${c.generation}`) },
                        { header: 'Base', render: (c) => formatMoney(c.base_amount) },
                        { header: 'Rate', render: (c) => `${Number(c.rate)}%` },
                        { header: 'Amount', render: (c) => <strong className="text-emerald-600">{formatMoney(c.amount)}</strong> },
                        { header: 'Status', render: (c) => <Badge value={c.status} /> },
                        { header: 'Credited', render: (c) => formatDateTime(c.credited_at) },
                    ]}
                    rows={page.props.commissions.data}
                    rowKey={(c) => c.id}
                    emptyMessage="No commissions yet. Commissions are credited automatically when enabled by the club."
                />
                <Pagination currentPage={page.props.commissions.current_page} lastPage={page.props.commissions.last_page} />
            </div>
        </AppLayout>
    );
}
