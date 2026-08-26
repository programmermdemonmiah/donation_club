import AppLayout from '@/layouts/AppLayout';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatMoney } from '@/utils/format';

interface PaymentInfo {
    id: number;
    reference: string;
    amount: string;
    currency: string;
    status: string;
    gateway: string;
    created_at: string;
}

interface Initiation {
    type: string;
    reference: string;
    instructions: string;
    account_name: string;
    account_number: string;
}

export default function PaymentShow() {
    const page = usePage<PageProps & { payment: PaymentInfo; initiation: Initiation | null; depositReference: string }>();
    const { payment, initiation } = page.props;

    const form = useForm({ transaction_id: '' });

    if (!initiation || payment.status !== 'pending') {
        return (
            <AppLayout>
                <div className="mx-auto max-w-xl">
                    <Card>
                        <CardHeader title={`Payment ${payment.reference}`} action={<Badge value={payment.status} />} />
                        <CardBody>
                            <p className="text-sm text-gray-600">
                                Amount: <strong>{formatMoney(payment.amount)}</strong> · Deposit: {page.props.depositReference}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                This payment is no longer pending. Check your deposit history for its current state.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const submitProof = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('payments.manual-proof', payment.id));
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-xl space-y-6">
                <Card>
                    <CardHeader title="Complete your deposit" subtitle={`Deposit ${page.props.depositReference} — ${formatMoney(payment.amount)} ${payment.currency}`} />
                    <CardBody className="space-y-4">
                        {(initiation.account_name || initiation.account_number) && (
                            <div className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900 ring-1 ring-inset ring-indigo-600/10">
                                <p><strong>{initiation.account_name}</strong></p>
                                <p className="font-mono">{initiation.account_number}</p>
                            </div>
                        )}
                        <p className="text-sm leading-relaxed text-gray-600">{initiation.instructions}</p>
                        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
                            <p className="text-xs uppercase tracking-wide text-gray-400">Send exactly</p>
                            <p className="text-2xl font-bold text-gray-900">{formatMoney(payment.amount)}</p>
                            <p className="mt-1 font-mono text-sm text-indigo-600">Ref: {payment.reference}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Submit transfer proof" subtitle="After sending the money, submit the bank/agent transaction id for verification" />
                    <CardBody>
                        <form onSubmit={submitProof} className="space-y-4">
                            <Input
                                label="Transaction ID"
                                placeholder="e.g. FT25ABC1234567"
                                value={form.data.transaction_id}
                                onChange={(e) => form.setData('transaction_id', e.target.value)}
                                error={form.errors.transaction_id}
                                required
                            />
                            <Button type="submit" loading={form.processing} className="w-full">
                                Submit for verification
                            </Button>
                            <p className="text-xs text-gray-400">
                                Verification is manual and usually completes within 24 hours. Your deposit receives its sequence number once verified.
                            </p>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
