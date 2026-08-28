import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, humanizeType } from '@/utils/format';

interface Tx {
    id: number; reference: string; type: string; direction: 'credit' | 'debit';
    amount: string; status: string; description?: string; created_at: string;
}

const types = ['deposit','commission','return_payout','fund_disbursement','withdrawal_hold','withdrawal','withdrawal_release','adjustment'];

export default function Transactions() {
    const page = usePage<PageProps & { transactions: { data: Tx[]; current_page: number; last_page: number }; filters: { type?: string } }>();

    const setType = (value: string) => {
        router.get(route('transactions.index'), value ? { type: value } : {}, { preserveState: true });
    };

    return (
        <AppLayout>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Audit Trail</p>
                    <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Transactions</h1>
                </div>
                <div className="w-56">
                    <select
                        value={page.props.filters?.type ?? ''}
                        onChange={(e) => setType(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    >
                        <option value="">All types</option>
                        {types.map((type) => (
                            <option key={type} value={type}>{humanizeType(type)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Table<Tx>
                    columns={[
                        { header: 'Reference', render: (t) => <span className="font-mono text-xs font-bold text-gray-700">{t.reference}</span> },
                        { header: 'Type', render: (t) => <span className="text-sm font-semibold capitalize text-gray-600">{humanizeType(t.type)}</span> },
                        { header: 'Description', render: (t) => <span className="max-w-[200px] truncate text-xs text-gray-400">{t.description}</span> },
                        {
                            header: 'Amount',
                            render: (t) => (
                                <span className={`text-sm font-black ${t.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.direction === 'credit' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                            ),
                        },
                        { header: 'Status', render: (t) => <Badge value={t.status} /> },
                        { header: 'Date', render: (t) => <span className="text-xs text-gray-400">{formatDateTime(t.created_at)}</span> },
                    ]}
                    rows={page.props.transactions.data}
                    rowKey={(t) => t.id}
                />
                <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                    <Pagination currentPage={page.props.transactions.current_page} lastPage={page.props.transactions.last_page} />
                </div>
            </div>
        </AppLayout>
    );
}
