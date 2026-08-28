import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface CommissionRow {
    id: number; reference: string; generation: number; rate: string;
    base_amount: string; amount: string; status: string;
    from_user?: { name: string } | null; credited_at: string | null;
}

export default function Commissions() {
    const page = usePage<PageProps & {
        totals: { completed: string; all_time: string };
        byGeneration: Record<string, string>;
        commissions: { data: CommissionRow[]; current_page: number; last_page: number };
    }>();

    const stats = [
        { label: 'Total Earned', value: formatMoney(page.props.totals.completed), accent: 'emerald' },
        { label: 'All Time (incl. reversed)', value: formatMoney(page.props.totals.all_time), accent: 'gray' },
        ...Object.entries(page.props.byGeneration).slice(0, 2).map(([gen, total]) => ({
            label: Number(gen) === 1 ? 'Direct Commissions' : `Generation ${gen}`,
            value: formatMoney(total), accent: 'amber',
        })),
    ];

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Earnings</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Commissions</h1>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">{s.label}</p>
                        <p className={`mt-2 text-2xl font-black ${s.accent === 'emerald' ? 'text-emerald-600' : s.accent === 'amber' ? 'text-amber-600' : 'text-gray-700'}`}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-50 px-6 py-4">
                    <h2 className="text-sm font-black text-gray-900">Commission History</h2>
                    <p className="mt-0.5 text-xs text-gray-400">Credited automatically when enabled by the club.</p>
                </div>
                <Table<CommissionRow>
                    columns={[
                        { header: 'Reference', render: (c) => <span className="font-mono text-xs font-bold text-gray-700">{c.reference}</span> },
                        { header: 'From Member', render: (c) => <span className="font-semibold text-gray-700">{c.from_user?.name ?? '—'}</span> },
                        { header: 'Generation', render: (c) => (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${c.generation === 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                {c.generation === 1 ? 'Direct' : `Gen ${c.generation}`}
                            </span>
                        )},
                        { header: 'Base', render: (c) => <span className="text-sm text-gray-500">{formatMoney(c.base_amount)}</span> },
                        { header: 'Rate', render: (c) => <span className="font-semibold text-gray-600">{Number(c.rate)}%</span> },
                        { header: 'Earned', render: (c) => <span className="text-sm font-black text-emerald-600">{formatMoney(c.amount)}</span> },
                        { header: 'Status', render: (c) => <Badge value={c.status} /> },
                        { header: 'Credited', render: (c) => <span className="text-xs text-gray-400">{formatDateTime(c.credited_at)}</span> },
                    ]}
                    rows={page.props.commissions.data}
                    rowKey={(c) => c.id}
                    emptyMessage="No commissions yet. Commissions are credited automatically when enabled by the club."
                />
                <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                    <Pagination currentPage={page.props.commissions.current_page} lastPage={page.props.commissions.last_page} />
                </div>
            </div>
        </AppLayout>
    );
}
