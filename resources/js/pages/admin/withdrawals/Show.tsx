import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface WithdrawalDetail {
    id: number;
    reference: string;
    amount: string;
    fee: string;
    net_amount: string;
    method: string;
    account_information?: { account_name?: string; account_details?: string } | null;
    status: string;
    admin_note?: string | null;
    requested_at?: string | null;
    completed_at?: string | null;
    user?: { id: number; name: string; email: string } | null;
}

export default function AdminWithdrawalShow() {
    const page = usePage<PageProps & { withdrawal: WithdrawalDetail }>();
    const w = page.props.withdrawal;

    const act = (action: string, needsReason = false, confirmMsg?: string) => {
        if (confirmMsg && !window.confirm(confirmMsg)) return;

        let fields = {};
        if (needsReason) {
            const reason = window.prompt('Reason (min 5 chars):');
            if (!reason || reason.length < 5) { alert('Min 5 characters.'); return; }
            fields = { reason };
        }

        router.post(route(`admin.withdrawals.${action}`, w.id), fields, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Withdrawal {w.reference}</h1>
                    <p className="text-sm text-gray-500">
                        {w.user ? (
                            <a href={route('admin.users.show', w.user.id)} className="text-indigo-600 hover:text-indigo-500">{w.user.name}</a>
                        ) : '—'}{' '}
                        · requested {formatDateTime(w.requested_at)}
                    </p>
                </div>
                <Badge value={w.status} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader title="Payout details" subtitle="Account information is visible to administrators only" />
                    <CardBody className="space-y-2.5 text-sm">
                        <Row label="Amount" value={formatMoney(w.amount)} strong />
                        <Row label="Fee" value={formatMoney(w.fee)} />
                        <Row label="Net payout" value={formatMoney(w.net_amount)} strong />
                        <Row label="Method" value={<span className="capitalize">{w.method}</span>} />
                        <div className="my-2 border-t border-gray-100" />
                        <Row label="Account holder" value={w.account_information?.account_name ?? '—'} />
                        <Row label="Account details" value={w.account_information?.account_details ?? '—'} />
                        <div className="my-2 border-t border-gray-100" />
                        <Row label="Completed at" value={formatDateTime(w.completed_at)} />
                        {w.admin_note && <Row label="Admin note" value={w.admin_note} />}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Actions" subtitle="Amount is locked while pending/approved/processing" />
                    <CardBody className="space-y-2.5">
                        {w.status === 'pending' && (
                            <>
                                <Button className="w-full" onClick={() => act('approve')}>Approve</Button>
                                <Button variant="danger" className="w-full" onClick={() => act('reject', true)}>
                                    Reject (release funds)
                                </Button>
                            </>
                        )}
                        {w.status === 'approved' && (
                            <>
                                <Button className="w-full" onClick={() => act('process')}>Mark as processing</Button>
                                <Button className="w-full" variant="outline" onClick={() => act('complete', false, 'Confirm payout sent? This debits the wallet permanently.')}>
                                    Complete & debit
                                </Button>
                                <Button variant="danger" className="w-full" onClick={() => act('reject', true)}>Reject</Button>
                            </>
                        )}
                        {w.status === 'processing' && (
                            <>
                                <Button className="w-full" onClick={() => act('complete', false, 'Confirm payout sent? This debits the wallet permanently.')}>
                                    Complete & debit
                                </Button>
                                <Button variant="danger" className="w-full" onClick={() => act('fail', true)}>
                                    Mark failed (release funds)
                                </Button>
                            </>
                        )}
                        {!['pending', 'approved', 'processing'].includes(w.status) && (
                            <p className="text-sm text-gray-500">This withdrawal has been finalized. No further actions.</p>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-xs capitalize text-gray-500">{label}</dt>
            <dd className={`max-w-[60%] break-words text-right ${strong ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{value}</dd>
        </div>
    );
}
