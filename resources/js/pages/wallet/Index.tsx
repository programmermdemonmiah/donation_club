import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, humanizeType } from '@/utils/format';

interface Tx {
    id: number; reference: string; type: string; direction: 'credit' | 'debit';
    amount: string; status: string; balance_after?: string; description?: string; created_at: string;
}

function BalanceCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
    return (
        <div className={`rounded-2xl border p-6 ${accent}`}>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-current opacity-60">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
            {sub && <p className="mt-1.5 text-xs font-semibold opacity-50">{sub}</p>}
        </div>
    );
}

export default function Wallet() {
    const page = usePage<PageProps & {
        balance: string; lockedBalance: string; availableBalance: string;
        transactions: { data: Tx[]; current_page: number; last_page: number };
    }>();

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Financial Overview</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">My Wallet</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">Every wallet movement is permanently recorded below.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <BalanceCard label="Total Balance" value={formatMoney(page.props.balance)}
                    accent="border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-900" />
                <BalanceCard label="Available Balance" value={formatMoney(page.props.availableBalance)}
                    sub="Excludes locked withdrawal holds"
                    accent="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-900" />
                <BalanceCard label="Locked (Withdrawals)" value={formatMoney(page.props.lockedBalance)}
                    accent="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-700" />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
                <div className="border-b border-gray-50 px-6 py-5">
                    <h2 className="text-base font-black text-gray-900">Transaction Ledger</h2>
                    <p className="mt-0.5 text-xs font-medium text-gray-400">Every wallet movement with permanent references.</p>
                </div>
                <Table<Tx>
                    columns={[
                        { header: 'Reference', render: (t) => <span className="font-mono text-xs font-bold text-gray-700">{t.reference}</span> },
                        { header: 'Type', render: (t) => <span className="text-sm font-semibold capitalize text-gray-600">{humanizeType(t.type)}</span> },
                        {
                            header: 'Amount',
                            render: (t) => (
                                <span className={`text-sm font-black ${t.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.direction === 'credit' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                            ),
                        },
                        { header: 'Description', render: (t) => <span className="max-w-[200px] truncate text-xs text-gray-400">{t.description}</span> },
                        { header: 'Status', render: (t) => <Badge value={t.status} /> },
                        { header: 'Date', render: (t) => <span className="text-xs text-gray-400">{formatDateTime(t.created_at)}</span> },
                    ]}
                    rows={page.props.transactions.data}
                    rowKey={(t) => t.id}
                    emptyMessage="No transactions yet."
                />
                <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                    <Pagination currentPage={page.props.transactions.current_page} lastPage={page.props.transactions.last_page} />
                </div>
            </div>
        </AppLayout>
    );
}
