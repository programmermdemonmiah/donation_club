import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { StatCard } from '@/components/ui/StatCard';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, humanizeType } from '@/utils/format';

interface Tx {
    id: number;
    reference: string;
    type: string;
    direction: 'credit' | 'debit';
    amount: string;
    status: string;
    balance_after?: string;
    description?: string;
    created_at: string;
}

export default function Wallet() {
    const page = usePage<
        PageProps & {
            balance: string;
            lockedBalance: string;
            availableBalance: string;
            transactions: { data: Tx[]; current_page: number; last_page: number };
        }
    >();

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Wallet</h1>

            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Balance" value={formatMoney(page.props.balance)} accent="text-indigo-600" />
                <StatCard label="Available" value={formatMoney(page.props.availableBalance)} accent="text-emerald-600" sub="Excludes locked withdrawal holds" />
                <StatCard label="Locked (Withdrawals)" value={formatMoney(page.props.lockedBalance)} accent="text-amber-600" />
            </dl>

            <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h3 className="text-sm font-semibold text-gray-900">Ledger</h3>
                    <p className="text-xs text-gray-500">Every wallet movement is recorded here with a permanent reference.</p>
                </div>
                <Table<Tx>
                    columns={[
                        { header: 'Reference', render: (t) => <span className="font-mono text-xs">{t.reference}</span> },
                        { header: 'Type', render: (t) => humanizeType(t.type) },
                        {
                            header: 'Amount',
                            render: (t) => (
                                <span className={t.direction === 'credit' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                                    {t.direction === 'credit' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                            ),
                        },
                        ...(page.url.includes('balance_after') ? [] : []),
                        { header: 'Description', render: (t) => <span className="max-w-xs truncate text-xs text-gray-500">{t.description}</span> },
                        { header: 'Status', render: (t) => <Badge value={t.status} /> },
                        { header: 'Date', render: (t) => formatDateTime(t.created_at) },
                    ]}
                    rows={page.props.transactions.data}
                    rowKey={(t) => t.id}
                    emptyMessage="No transactions yet."
                />
                <Pagination currentPage={page.props.transactions.current_page} lastPage={page.props.transactions.last_page} />
            </div>
        </AppLayout>
    );
}
