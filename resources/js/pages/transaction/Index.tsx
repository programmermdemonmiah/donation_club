import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, humanizeType } from '@/utils/format';

interface Tx {
    id: number;
    reference: string;
    type: string;
    direction: 'credit' | 'debit';
    amount: string;
    status: string;
    description?: string;
    created_at: string;
}

const types = ['deposit', 'commission', 'return_payout', 'fund_disbursement', 'withdrawal_hold', 'withdrawal', 'withdrawal_release', 'adjustment'];

export default function Transactions() {
    const page = usePage<PageProps & { transactions: { data: Tx[]; current_page: number; last_page: number }; filters: { type?: string } }>();

    const setType = (value: string) => {
        router.get(route('transactions.index'), value ? { type: value } : {}, { preserveState: true });
    };

    return (
        <AppLayout>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
                <div className="w-56">
                    <Select value={page.props.filters?.type ?? ''} onChange={(e) => setType(e.target.value)}>
                        <option value="">All types</option>
                        {types.map((type) => (
                            <option key={type} value={type}>{humanizeType(type)}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<Tx>
                    columns={[
                        { header: 'Reference', render: (t) => <span className="font-mono text-xs">{t.reference}</span> },
                        { header: 'Type', render: (t) => humanizeType(t.type) },
                        { header: 'Description', render: (t) => <span className="max-w-xs truncate text-xs text-gray-500">{t.description}</span> },
                        {
                            header: 'Amount',
                            render: (t) => (
                                <span className={t.direction === 'credit' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                                    {t.direction === 'credit' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                            ),
                        },
                        { header: 'Status', render: (t) => <Badge value={t.status} /> },
                        { header: 'Date', render: (t) => formatDateTime(t.created_at) },
                    ]}
                    rows={page.props.transactions.data}
                    rowKey={(t) => t.id}
                />
                <Pagination currentPage={page.props.transactions.current_page} lastPage={page.props.transactions.last_page} />
            </div>
        </AppLayout>
    );
}
