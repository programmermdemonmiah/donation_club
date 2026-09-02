import AdminLayout from '@/layouts/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { usePage } from '@inertiajs/react';
import { formatDate, formatMoney } from '@/utils/format';
import type { PageProps } from '@/types';

interface Stats {
    users: { total: number; active: number; blocked: number };
    deposits: { total_amount: string; count: number; today_amount: string; pending_payments: number };
    returns: { total_payout: string; count: number; pending: number };
    commissions: { total: string; pending: number };
    withdrawals: { total: string; count: number; pending: number };
    referrals: { relationships: number };
    ranks: { distributed: number };
    funds: { requests: number; disbursed: string };
}

interface ChartRow {
    day: string;
    total: string;
    count: number;
}

export default function AdminDashboard() {
    const page = usePage<PageProps & { stats: Stats; chart: ChartRow[]; moduleFlags: Record<string, boolean> }>();
    const s = page.props.stats;
    const chart = page.props.chart;
    const maxChart = Math.max(1, ...chart.map((c) => Number(c.total)));

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-gray-900">Overview</h1>
                <div className="flex gap-2">
                    {Object.entries(page.props.moduleFlags).map(([flag, enabled]) => (
                        <span key={flag} className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${enabled ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-gray-100 text-gray-500 ring-gray-400/20'}`}>
                            {flag.replace('_enabled', '').replace(/_/g, ' ')}: {enabled ? 'ON' : 'OFF'}
                        </span>
                    ))}
                </div>
            </div>

            {/* Users */}
            <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Members</h2>
            <dl className="mt-2 grid gap-4 sm:grid-cols-3">
                <StatCard label="Total Users" value={s.users.total} />
                <StatCard label="Active" value={s.users.active} accent="text-emerald-600" />
                <StatCard label="Blocked" value={s.users.blocked} accent="text-rose-600" />
            </dl>

            {/* Money */}
            <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-gray-400">Financial</h2>
            <dl className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Deposits" value={formatMoney(s.deposits.total_amount)} sub={`${s.deposits.count} completed`} />
                <StatCard label="Today's Deposits" value={formatMoney(s.deposits.today_amount)} accent="text-blue-600" />
                <StatCard label="Pending Payments" value={s.deposits.pending_payments} accent="text-blue-600" />
                <StatCard label="Support Provided" value={formatMoney(s.returns.total_payout)} sub={`${s.returns.pending} pending`} />
                <StatCard label="Donations Shared" value={formatMoney(s.commissions.total)} />
                <StatCard label="Withdrawals Paid" value={formatMoney(s.withdrawals.total)} sub={`${s.withdrawals.count} completed`} />
                <StatCard label="Pending Withdrawals" value={s.withdrawals.pending} accent="text-blue-600" />
                <StatCard label="Funds Disbursed" value={formatMoney(s.funds.disbursed)} sub={`${s.funds.requests} requests`} />
            </dl>

            {/* Community */}
            <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-gray-400">Community</h2>
            <dl className="mt-2 grid gap-4 sm:grid-cols-3">
                <StatCard label="Referral Links" value={s.referrals.relationships} />
                <StatCard label="Ranked Members" value={s.ranks.distributed} />
                <StatCard label="Support Records" value={s.returns.count} />
            </dl>

            {/* Chart */}
            <Card className="mt-8">
                <CardHeader title="Completed deposits — last 14 days" />
                <CardBody>
                    {chart.length === 0 ? (
                        <p className="py-10 text-center text-sm text-gray-500">No deposit activity yet.</p>
                    ) : (
                        <div className="flex h-40 items-end gap-2">
                            {chart.map((row) => (
                                <div key={row.day} className="group flex flex-1 flex-col items-center justify-end">
                                    <span className="mb-1 hidden text-xs font-semibold text-gray-600 group-hover:block">${Number(row.total).toFixed(0)}</span>
                                    <div
                                        className="w-full rounded-t bg-blue-500/80 transition-colors group-hover:bg-blue-600"
                                        style={{ height: `${(Number(row.total) / maxChart) * 100}%`, minHeight: '4px' }}
                                    />
                                    <span className="mt-1 text-[10px] text-gray-400">{formatDate(row.day)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
