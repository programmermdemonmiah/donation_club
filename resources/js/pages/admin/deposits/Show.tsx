import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, formatSequence } from '@/utils/format';

interface DepositDetail {
    id: number;
    reference: string;
    amount: string;
    status: string;
    sequence_number: number | null;
    eligibility_snapshot?: { reason?: string; rules?: Record<string, unknown> } | null;
    created_at: string;
    completed_at: string | null;
    user?: { id: number; name: string; email: string } | null;
    payments: Array<{
        id: number;
        reference: string;
        gateway: string;
        status: string;
        gateway_reference?: string | null;
        transactions: Array<{
            id: number;
            type: string;
            external_reference?: string | null;
            processed: boolean;
            created_at: string;
        }>;
    }>;
}

export default function AdminDepositShow() {
    const page = usePage<PageProps & { deposit: DepositDetail }>();
    const deposit = page.props.deposit;

    const verify = (paymentId: number, decision: 'approve' | 'reject') => {
        if (decision === 'approve' && !window.confirm('Confirm this payment? The deposit gets its sequence number and cannot be undone silently.')) {
            return;
        }
        router.post(route('admin.deposits.verify-payment', deposit.id), { payment_id: paymentId, decision }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Deposit {formatSequence(deposit.sequence_number)}</h1>
                    <p className="text-sm text-gray-500">
                        <span className="font-mono">{deposit.reference}</span> ·{' '}
                        {deposit.user ? (
                            <a href={route('admin.users.show', deposit.user.id)} className="text-blue-600 hover:text-blue-500">
                                {deposit.user.name}
                            </a>
                        ) : '—'}{' '}
                        · {formatDateTime(deposit.created_at)}
                    </p>
                </div>
                <Badge value={deposit.status} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader title="Summary" />
                    <CardBody className="space-y-2.5 text-sm">
                        <Row label="Amount" value={formatMoney(deposit.amount)} strong />
                        <Row label="Sequence" value={formatSequence(deposit.sequence_number)} />
                        <Row label="Completed" value={formatDateTime(deposit.completed_at)} />
                        {deposit.eligibility_snapshot?.rules && (
                            <>
                                <div className="my-2 border-t border-gray-100" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Eligibility snapshot</p>
                                {Object.entries(deposit.eligibility_snapshot.rules).map(([key, value]) => (
                                    <Row key={key} label={key.replace(/_/g, ' ')} value={String(value)} />
                                ))}
                            </>
                        )}
                    </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader title="Payments & verification" subtitle="Approving a manual payment completes the deposit atomically" />
                    <CardBody className="space-y-4">
                        {deposit.payments.length === 0 && <p className="text-sm text-gray-500">No payments recorded.</p>}
                        {deposit.payments.map((payment) => (
                            <div key={payment.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <span className="font-mono text-xs">{payment.reference}</span>
                                        <span className="ml-2 capitalize text-xs text-gray-400">{payment.gateway}</span>
                                    </div>
                                    <Badge value={payment.status} />
                                </div>

                                {payment.transactions.filter((t) => t.external_reference).length > 0 && (
                                    <ul className="mt-3 space-y-1.5">
                                        {payment.transactions
                                            .filter((t) => t.external_reference)
                                            .map((tx) => (
                                                <li key={tx.id} className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm ring-1 ring-inset ring-gray-200/60">
                                                    <span>
                                                        Submitted tx: <strong className="font-mono">{tx.external_reference}</strong>
                                                        {!tx.processed && <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">unprocessed</span>}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{formatDateTime(tx.created_at)}</span>
                                                </li>
                                            ))}
                                    </ul>
                                )}

                                {payment.status === 'processing' && (
                                    <div className="mt-3 flex gap-2">
                                        <Button size="sm" onClick={() => verify(payment.id, 'approve')}>
                                            Approve → complete deposit
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => verify(payment.id, 'reject')}>
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-xs capitalize text-gray-500">{label}</dt>
            <dd className={`${strong ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{value}</dd>
        </div>
    );
}
