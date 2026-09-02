import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, formatSequence } from '@/utils/format';

interface MemberDetail {
    id: number;
    name: string;
    email: string;
    status: string;
    is_admin: boolean;
    referral_code: string;
    joined_at: string;
    profile?: { phone?: string; city?: string; country?: string; address?: string } | null;
    rank?: { name: string } | null;
    wallet?: { balance: string; locked: string; available: string } | null;
    referrer?: { id: number; name: string; email: string } | null;
    stats: {
        total_deposits: string;
        deposits_count: number;
        direct_referrals: number;
        team_size: number;
        team_volume: string;
    };
}

interface DepositRow {
    reference: string;
    amount: string;
    status: string;
    sequence_number: number | null;
    completed_at: string | null;
}

interface TxRow {
    reference: string;
    type: string;
    direction: 'credit' | 'debit';
    amount: string;
    status: string;
}

export default function AdminUserShow() {
    const page = usePage<PageProps & { member: MemberDetail; recentDeposits: DepositRow[]; recentTransactions: TxRow[] }>();
    const member = page.props.member;
    const [blockOpen, setBlockOpen] = useState(false);

    const act = (action: 'block' | 'activate') => {
        router.post(route(`admin.users.${action}`, member.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
                    <p className="text-sm text-gray-500">
                        {member.email} · <span className="font-mono">{member.referral_code}</span> · joined{' '}
                        {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge value={member.status} />
                    {!member.is_admin && (
                        member.status === 'active' ? (
                            <Button variant="danger" onClick={() => setBlockOpen(true)}>Block user</Button>
                        ) : (
                            <Button onClick={() => act('activate')}>Activate user</Button>
                        )
                    )}
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader title="Profile & wallet" />
                    <CardBody className="space-y-2.5 text-sm">
                        <Row label="Rank" value={member.rank?.name ?? 'None'} />
                        <Row label="Phone" value={member.profile?.phone ?? '—'} />
                        <Row label="Location" value={[member.profile?.city, member.profile?.country].filter(Boolean).join(', ') || '—'} />
                        <Row label="Referrer" value={member.referrer ? `${member.referrer.name} (${member.referrer.email})` : 'Direct registration'} />
                        <div className="my-3 border-t border-gray-100" />
                        {member.wallet && (
                            <>
                                <Row label="Balance" value={formatMoney(member.wallet.balance)} strong />
                                <Row label="Available" value={formatMoney(member.wallet.available)} />
                                <Row label="Locked" value={formatMoney(member.wallet.locked)} />
                            </>
                        )}
                        <div className="my-3 border-t border-gray-100" />
                        <Row label="Total deposits" value={formatMoney(member.stats.total_deposits)} strong />
                        <Row label="Completed deposits" value={String(member.stats.deposits_count)} />
                        <Row label="Team size" value={String(member.stats.team_size)} />
                        <Row label="Team volume" value={formatMoney(member.stats.team_volume)} />
                    </CardBody>
                </Card>

                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader title="Recent deposits" subtitle={`${member.stats.direct_referrals} direct referrals`} action={
                            <a href={route('admin.deposits.index')} className="text-xs font-medium text-blue-600">View all →</a>
                        } />
                        <CardBody className="space-y-2">
                            {page.props.recentDeposits.length === 0 && <p className="text-sm text-gray-500">No deposits.</p>}
                            {page.props.recentDeposits.map((d) => (
                                <div key={d.reference} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                                    <span className="font-mono text-xs text-gray-500">{d.reference}</span>
                                    <span className="font-semibold text-blue-600">{formatSequence(d.sequence_number)}</span>
                                    <span>{formatMoney(d.amount)}</span>
                                    <Badge value={d.status} />
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader
                            title="Wallet adjustment"
                            subtitle="Manual credit/debit — fully audited with ledger entry"
                            action={<a href={route('admin.wallets.transactions')} className="text-xs font-medium text-blue-600">Ledger →</a>}
                        />
                        <CardBody className="space-y-2">
                            {page.props.recentTransactions.length === 0 && <p className="text-sm text-gray-500">No transactions.</p>}
                            {page.props.recentTransactions.slice(0, 5).map((t) => (
                                <div key={t.reference} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                                    <span className={`text-xs font-medium ${t.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.direction === 'credit' ? '+' : '-'}{formatMoney(t.amount)}
                                    </span>
                                    <span className="capitalize text-gray-500">{t.type.replace(/_/g, ' ')}</span>
                                    <Badge value={t.status} />
                                </div>
                            ))}
                            <form
                                className="mt-3 flex flex-wrap items-end gap-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.currentTarget);
                                    router.post(route('admin.wallets.adjust', member.id), fd, { preserveScroll: true });
                                }}
                            >
                                <select name="direction" className="rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                    <option value="credit">Credit +</option>
                                    <option value="debit">Debit −</option>
                                </select>
                                <input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="w-28 rounded-lg border-gray-300 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                <input name="reason" placeholder="Reason (required)" required className="min-w-0 flex-1 rounded-lg border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                <Button type="submit" size="sm" variant="outline">Apply</Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                open={blockOpen}
                onClose={() => setBlockOpen(false)}
                onConfirm={() => {
                    act('block');
                    setBlockOpen(false);
                }}
                title="Block this member?"
                message="They will be logged out and unable to log in until reactivated."
                confirmLabel="Block"
                danger
            />
        </AdminLayout>
    );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className={`max-w-[60%] truncate ${strong ? 'font-bold text-gray-900' : 'text-sm text-gray-700'} capitalize`}>{value}</dd>
        </div>
    );
}
