import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, humanizeType } from '@/utils/format';

interface TxRow {
    id: number;
    reference: string;
    user?: { id: number; name: string; email: string } | null;
    type: string;
    direction: 'credit' | 'debit';
    amount: string;
    balance_after: string;
    status: string;
    description?: string | null;
    created_at: string;
}

const types = ['commission', 'return_payout', 'fund_disbursement', 'withdrawal_hold', 'withdrawal', 'withdrawal_release', 'adjustment'];

export default function AdminWalletTransactions() {
    const page = usePage<PageProps & { transactions: { data: TxRow[]; current_page: number; last_page: number }; filters: { type?: string } }>();

    const setType = (type: string) => {
        router.get(route('admin.wallets.transactions'), type ? { type } : {}, { preserveState: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Wallet Ledger</h1>
            <p className="mt-1 text-sm text-gray-500">Every wallet movement across the platform, with running balances.</p>

            <div className="mt-4 w-52">
                <Select value={page.props.filters?.type ?? ''} onChange={(e) => setType(e.target.value)}>
                    <option value="">All types</option>
                    {types.map((t) => (
                        <option key={t} value={t}>{humanizeType(t)}</option>
                    ))}
                </Select>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<TxRow>
                    columns={[
                        { header: 'Reference', render: (t) => <span className="font-mono text-xs">{t.reference}</span> },
                        {
                            header: 'Member',
                            render: (t) =>
                                t.user ? (
                                    <a href={route('admin.users.show', t.user.id)} className="text-indigo-600 hover:text-indigo-500">{t.user.name}</a>
                                ) : '—',
                        },
                        { header: 'Type', render: (t) => humanizeType(t.type) },
                        {
                            header: 'Amount',
                            render: (t) => (
                                <span className={t.direction === 'credit' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                                    {t.direction === 'credit' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                            ),
                        },
                        { header: 'Balance after', render: (t) => formatMoney(t.balance_after) },
                        { header: 'Status', render: (t) => <Badge value={t.status} /> },
                        { header: 'Description', render: (t) => <span className="max-w-[220px] truncate text-xs text-gray-500">{t.description}</span> },
                        { header: 'Date', render: (t) => formatDateTime(t.created_at) },
                    ]}
                    rows={page.props.transactions.data}
                    rowKey={(t) => t.id}
                    emptyMessage="No wallet transactions yet."
                />
                <Pagination currentPage={page.props.transactions.current_page} lastPage={page.props.transactions.last_page} />
            </div>
        </AdminLayout>
    );
}
