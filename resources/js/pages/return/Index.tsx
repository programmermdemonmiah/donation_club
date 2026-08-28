import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface ReturnRow {
    id: number; reference: string; deposit_reference?: string;
    base_amount: string; rate: string; payout_amount: string;
    status: string; completed_at: string | null; created_at: string;
}

export default function Returns() {
    const page = usePage<PageProps & {
        returns: { data: ReturnRow[]; current_page: number; last_page: number };
        eligibility: { eligible: boolean; failed: Array<{ requirement: string; required: string; actual: string }> };
        termsNote?: string | null;
    }>();

    return (
        <AppLayout>
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Community Rewards</p>
                    <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Returns & Rewards</h1>
                    <p className="mt-2 max-w-xl text-sm font-medium text-gray-500">
                        Discretionary community rewards. No fixed payout date; each return requires eligibility and administrator approval.
                    </p>
                </div>
                <span className={`mt-1 rounded-full px-4 py-1.5 text-xs font-black ${page.props.eligibility.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {page.props.eligibility.eligible ? '✓ Eligible — awaiting administrator' : 'Not yet eligible'}
                </span>
            </div>

            {!page.props.eligibility.eligible && page.props.eligibility.failed.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Eligibility Checklist</h2>
                        <p className="mt-0.5 text-xs text-gray-400">Requirements to meet before qualifying for rewards</p>
                    </div>
                    <ul className="divide-y divide-gray-50 px-6">
                        {page.props.eligibility.failed.map((item) => (
                            <li key={item.requirement} className="flex items-center justify-between py-3.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="h-2 w-2 rounded-full bg-rose-300" />
                                    <span className="text-sm font-semibold text-gray-700">{item.requirement}</span>
                                </div>
                                <span className="text-xs font-medium text-gray-500">
                                    Need <strong className="text-gray-800">{item.required}</strong> · yours <strong className="text-amber-600">{item.actual}</strong>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {page.props.termsNote && (
                <div className="mb-6 rounded-2xl border border-amber-200/50 bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-900">{page.props.termsNote}</p>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-50 px-6 py-4">
                    <h2 className="text-sm font-black text-gray-900">Returns History</h2>
                </div>
                <Table<ReturnRow>
                    columns={[
                        { header: 'Reference', render: (r) => <span className="font-mono text-xs font-bold text-gray-700">{r.reference}</span> },
                        { header: 'Deposit', render: (r) => <span className="font-mono text-xs text-gray-500">{r.deposit_reference ?? '—'}</span> },
                        { header: 'Base', render: (r) => <span className="font-semibold text-gray-600">{formatMoney(r.base_amount)}</span> },
                        { header: 'Rate', render: (r) => <span className="font-semibold text-gray-600">{Number(r.rate) ? `${Number(r.rate)}%` : '—'}</span> },
                        { header: 'Payout', render: (r) => <span className="font-black text-emerald-600">{formatMoney(r.payout_amount)}</span> },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Completed', render: (r) => <span className="text-xs text-gray-400">{formatDateTime(r.completed_at)}</span> },
                    ]}
                    rows={page.props.returns.data}
                    rowKey={(r) => r.id}
                    emptyMessage="No returns yet. They are created automatically once the club enables the reward module."
                />
                <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                    <Pagination currentPage={page.props.returns.current_page} lastPage={page.props.returns.last_page} />
                </div>
            </div>
        </AppLayout>
    );
}
