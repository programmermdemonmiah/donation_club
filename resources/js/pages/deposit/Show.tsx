import AppLayout from '@/layouts/AppLayout';
import Badge from '@/components/ui/Badge';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, formatSequence } from '@/utils/format';

interface DepositDetail {
    id: number;
    reference: string;
    amount: string;
    status: string;
    sequence_number: number | null;
    completed_at: string | null;
    created_at: string;
    payments: Array<{
        id: number;
        reference: string;
        gateway: string;
        status: string;
        amount: string;
    }>;
}

export default function DepositShow() {
    const page = usePage<PageProps & { deposit: DepositDetail; return?: { status: string; payout_amount: string } | null }>();
    const { deposit, return: memberReturn } = page.props;

    return (
        <AppLayout>
            <div className="mx-auto max-w-3xl space-y-6">
                <Card>
                    <CardHeader title={`Deposit ${deposit.reference}`} subtitle={`Created ${formatDateTime(deposit.created_at)}`} action={<Badge value={deposit.status} />} />
                    <CardBody className="space-y-3">
                        <Row label="Amount" value={formatMoney(deposit.amount)} strong />
                        <Row label="Sequence Number" value={formatSequence(deposit.sequence_number)} strong />
                        <Row label="Completed" value={formatDateTime(deposit.completed_at)} />
                        {memberReturn && (
                            <>
                                <Row label="Linked Return Status" value={memberReturn.status} />
                                <Row label="Return Payout" value={formatMoney(memberReturn.payout_amount)} />
                            </>
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Payments" subtitle="Payment attempts linked to this deposit" />
                    <CardBody className="space-y-3">
                        {deposit.payments.length === 0 && <p className="text-sm text-gray-500">No payments recorded.</p>}
                        {deposit.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                <div>
                                    <span className="font-mono text-xs text-gray-700">{payment.reference}</span>
                                    <p className="text-xs capitalize text-gray-400">{payment.gateway.replace(/_/g, ' ')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span>{formatMoney(payment.amount)}</span>
                                    <Badge value={payment.status} />
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-none last:pb-0">
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className={`capitalize ${strong ? 'text-base font-bold text-gray-900' : 'text-sm text-gray-800'}`}>{value ?? '—'}</dd>
        </div>
    );
}
