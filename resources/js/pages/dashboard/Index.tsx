import AppLayout from '@/layouts/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface Stats {
    balance: string;
    locked_balance: string;
    total_deposit: string;
    total_return: string;
    total_commission: string;
    total_withdrawn: string;
    pending_withdrawal: string;
    direct_referrals: number;
    team_size: number;
    current_rank?: string;
}

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

export default function Dashboard() {
    const page = usePage<PageProps & { stats: Stats; recentTransactions: Tx[]; depositRules: { min: string; max: string } }>();
    const { stats, recentTransactions, depositRules } = page.props;

    return (
        <AppLayout>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Welcome back, {page.props.auth.user?.name.split(' ')[0]}</h1>
                    <p className="mt-1 text-sm text-gray-500">Here is your club overview.</p>
                </div>
                <Link
                    href={route('deposits.index')}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    New Deposit ({depositRules.min}–{depositRules.max})
                </Link>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Current Balance" value={formatMoney(stats.balance)} accent="text-indigo-600" sub={`${formatMoney(stats.locked_balance)} locked`} />
                <StatCard label="Total Deposits" value={formatMoney(stats.total_deposit)} />
                <StatCard label="Total Returns" value={formatMoney(stats.total_return)} accent="text-emerald-600" />
                <StatCard label="Total Commissions" value={formatMoney(stats.total_commission)} accent="text-emerald-600" />
                <StatCard label="Direct Referrals" value={stats.direct_referrals} />
                <StatCard label="Team Size" value={stats.team_size} />
                <StatCard label="Current Rank" value={stats.current_rank ?? '—'} />
                <StatCard label="Pending Withdrawal" value={formatMoney(stats.pending_withdrawal)} accent="text-amber-600" sub={`Withdrawn: ${formatMoney(stats.total_withdrawn)}`} />
            </dl>

            <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Wallet Activity</h3>
                    <Link href={route('transactions.index')} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                        View all →
                    </Link>
                </div>
                <Table<Tx>
                    columns={[
                        { header: 'Reference', render: (t) => <span className="font-mono text-xs">{t.reference}</span> },
                        { header: 'Type', render: (t) => t.type.replace(/_/g, ' ') },
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
                    rows={recentTransactions}
                    rowKey={(t) => t.id}
                    emptyMessage="No wallet activity yet — your commissions, returns and withdrawals will appear here."
                />
            </div>
        </AppLayout>
    );
}
