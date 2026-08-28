import AppLayout from '@/layouts/AppLayout';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface Stats {
    balance: string; locked_balance: string; total_deposit: string;
    total_return: string; total_commission: string; total_withdrawn: string;
    pending_withdrawal: string; direct_referrals: number; team_size: number;
    current_rank?: string;
}
interface Tx {
    id: number; reference: string; type: string; direction: 'credit' | 'debit';
    amount: string; status: string; description?: string; created_at: string;
}

function StatCard({ label, value, sub, icon, accent = 'amber' }: {
    label: string; value: string | number; sub?: string;
    icon: string; accent?: 'amber' | 'emerald' | 'blue' | 'rose';
}) {
    const colors = {
        amber: 'bg-amber-50 text-amber-600 ring-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        blue: 'bg-blue-50 text-blue-600 ring-blue-100',
        rose: 'bg-rose-50 text-rose-600 ring-rose-100',
    };
    const textColors = {
        amber: 'text-amber-600', emerald: 'text-emerald-600',
        blue: 'text-blue-600', rose: 'text-rose-600',
    };
    return (
        <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md hover:shadow-gray-200/60">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">{label}</p>
                    <p className={`mt-2 text-2xl font-black tracking-tight ${textColors[accent]}`}>{value}</p>
                    {sub && <p className="mt-1 text-xs font-semibold text-gray-400">{sub}</p>}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${colors[accent]} transition-transform duration-300 group-hover:scale-110`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const page = usePage<PageProps & { stats: Stats; recentTransactions: Tx[]; depositRules: { min: string; max: string } }>();
    const { stats, recentTransactions, depositRules } = page.props;
    const firstName = page.props.auth.user?.name.split(' ')[0];

    return (
        <AppLayout>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Welcome back</p>
                    <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">{firstName}'s Dashboard</h1>
                    <p className="mt-1 text-sm font-medium text-gray-500">Here's your complete club overview.</p>
                </div>
                <Link
                    href={route('deposits.index')}
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
                >
                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    New Deposit (${depositRules.min}–${depositRules.max})
                </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Available Balance" value={formatMoney(stats.balance)} sub={`${formatMoney(stats.locked_balance)} locked`} accent="amber"
                    icon="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                <StatCard label="Total Deposited" value={formatMoney(stats.total_deposit)} accent="blue"
                    icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                <StatCard label="Total Returns" value={formatMoney(stats.total_return)} accent="emerald"
                    icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <StatCard label="Total Commissions" value={formatMoney(stats.total_commission)} accent="emerald"
                    icon="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                <StatCard label="Direct Referrals" value={stats.direct_referrals} accent="blue"
                    icon="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                <StatCard label="Team Size" value={stats.team_size} accent="blue"
                    icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                <StatCard label="Current Rank" value={stats.current_rank ?? '—'} accent="amber"
                    icon="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                <StatCard label="Pending Withdrawal" value={formatMoney(stats.pending_withdrawal)} sub={`Withdrawn: ${formatMoney(stats.total_withdrawn)}`} accent="rose"
                    icon="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </div>

            {/* Recent Transactions */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
                <div className="flex items-center justify-between border-b border-gray-50 px-6 py-5">
                    <div>
                        <h2 className="text-base font-black text-gray-900">Recent Wallet Activity</h2>
                        <p className="mt-0.5 text-xs font-medium text-gray-400">Your latest transactions</p>
                    </div>
                    <Link href={route('transactions.index')} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                        View all →
                    </Link>
                </div>
                <Table<Tx>
                    columns={[
                        { header: 'Reference', render: (t) => <span className="font-mono text-xs font-bold text-gray-700">{t.reference}</span> },
                        { header: 'Type', render: (t) => <span className="text-sm font-semibold text-gray-600 capitalize">{t.type.replace(/_/g, ' ')}</span> },
                        {
                            header: 'Amount',
                            render: (t) => (
                                <span className={`text-sm font-black ${t.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.direction === 'credit' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                            ),
                        },
                        { header: 'Status', render: (t) => <Badge value={t.status} /> },
                        { header: 'Date', render: (t) => <span className="text-xs font-medium text-gray-400">{formatDateTime(t.created_at)}</span> },
                    ]}
                    rows={recentTransactions}
                    rowKey={(t) => t.id}
                    emptyMessage="No wallet activity yet — commissions, returns and withdrawals appear here."
                />
            </div>
        </AppLayout>
    );
}
