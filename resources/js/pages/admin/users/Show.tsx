import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { router, usePage, useForm } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, formatSequence, statusColor } from '@/utils/format';

interface MemberDetail {
    id: number;
    name: string;
    email: string;
    status: string;
    is_admin: boolean;
    is_agent: boolean;
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

    const adjustForm = useForm({
        direction: 'credit',
        amount: '',
        reason: '',
    });

    const submitAdjust = (e: FormEvent) => {
        e.preventDefault();
        adjustForm.post(route('admin.wallets.adjust', member.id), {
            preserveScroll: true,
            onSuccess: () => adjustForm.reset('amount', 'reason'),
        });
    };

    const act = (action: 'block' | 'activate' | 'toggle-agent') => {
        router.post(route(`admin.users.${action}`, member.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div className="mb-4">
                <a href={route('admin.users.index')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to users
                </a>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
                    <p className="text-sm text-gray-500">
                        {member.email} · <span className="font-mono">{member.referral_code}</span> · joined{' '}
                        {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset capitalize ${statusColor(member.status)}`}>
                        {member.status}
                    </span>
                    {member.is_agent && (
                        <span className="inline-flex items-center justify-center rounded-lg bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm ring-1 ring-inset ring-purple-700/20">
                            Agent
                        </span>
                    )}
                    {!member.is_admin && (
                        <>
                            <Button variant="outline" onClick={() => act('toggle-agent')}>
                                {member.is_agent ? 'Revoke Agent' : 'Make Agent'}
                            </Button>
                            {member.status === 'active' ? (
                                <Button variant="danger" onClick={() => setBlockOpen(true)}>Block</Button>
                            ) : (
                                <Button onClick={() => act('activate')}>Activate</Button>
                            )}
                        </>
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
                            <a href={route('admin.deposits.index')} className="inline-flex items-center justify-center rounded-lg bg-blue-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                View all &rarr;
                            </a>
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
                            action={
                                <a href={route('admin.wallets.transactions')} className="inline-flex items-center justify-center rounded-lg bg-blue-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    Ledger &rarr;
                                </a>
                            }
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
                            <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={submitAdjust}>
                                <div className="flex flex-wrap items-end gap-3 w-full">
                                    <select 
                                        value={adjustForm.data.direction}
                                        onChange={e => adjustForm.setData('direction', e.target.value)}
                                        className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="credit">Credit +</option>
                                        <option value="debit">Debit −</option>
                                    </select>
                                    <input 
                                        type="number" step="0.01" min="0.01" placeholder="0.00" required 
                                        value={adjustForm.data.amount}
                                        onChange={e => adjustForm.setData('amount', e.target.value)}
                                        className={`w-28 rounded-lg border py-2 pl-3 pr-2 text-sm shadow-sm focus:ring-blue-500 ${adjustForm.errors.amount ? 'border-red-500' : 'border-gray-300'}`} 
                                    />
                                    <input 
                                        placeholder="Reason (required)" required 
                                        value={adjustForm.data.reason}
                                        onChange={e => adjustForm.setData('reason', e.target.value)}
                                        className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm shadow-sm focus:ring-blue-500 ${adjustForm.errors.reason ? 'border-red-500' : 'border-gray-300'}`} 
                                    />
                                    <Button type="submit" variant="outline" disabled={adjustForm.processing}>Apply</Button>
                                </div>
                                {(adjustForm.errors.amount || adjustForm.errors.reason || page.props.errors?.adjustment) && (
                                    <div className="w-full text-xs text-red-600 mt-1">
                                        {adjustForm.errors.amount || adjustForm.errors.reason || page.props.errors?.adjustment}
                                    </div>
                                )}
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
