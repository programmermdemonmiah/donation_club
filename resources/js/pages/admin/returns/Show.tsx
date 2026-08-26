import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface ReturnDetail {
    id: number;
    reference: string;
    base_amount: string;
    rate: string;
    payout_amount: string;
    status: string;
    note?: string | null;
    approved_at?: string | null;
    completed_at?: string | null;
    user?: { id: number; name: string; email: string } | null;
    deposit?: { id: number; reference: string; amount?: string; completed_at?: string | null } | null;
}

export default function AdminReturnShow() {
    const page = usePage<PageProps & { return: ReturnDetail }>();
    const r = page.props.return;

    const act = (action: string, needsReason = false, confirmMsg?: string) => {
        if (confirmMsg && !window.confirm(confirmMsg)) return;

        let fields = {};
        if (needsReason) {
            const reason = window.prompt('Reason (min 5 chars):');
            if (!reason || reason.length < 5) { alert('Min 5 characters.'); return; }
            fields = { reason };
        }

        router.post(route(`admin.returns.${action}`, r.id), fields, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Return {r.reference}</h1>
                    <p className="text-sm text-gray-500">
                        {r.user ? (
                            <a href={route('admin.users.show', r.user.id)} className="text-indigo-600 hover:text-indigo-500">{r.user.name}</a>
                        ) : '—'}{' '}
                        · deposit {r.deposit?.reference}
                    </p>
                </div>
                <Badge value={r.status} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader title="Payout summary" />
                    <CardBody className="space-y-2.5 text-sm">
                        <Row label="Base amount" value={formatMoney(r.base_amount)} />
                        <Row label="Rate" value={Number(r.rate) ? `${Number(r.rate)}%` : '—'} />
                        <Row label="Payout amount" value={formatMoney(r.payout_amount)} strong />
                        <Row label="Approved at" value={formatDateTime(r.approved_at)} />
                        <Row label="Completed at" value={formatDateTime(r.completed_at)} />
                        {r.note && <Row label="Note" value={r.note} />}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Actions" />
                    <CardBody className="space-y-2.5">
                        {(r.status === 'pending' || r.status === 'eligible') && (
                            <>
                                <Button className="w-full" onClick={() => act('approve')}>Approve</Button>
                                <Button variant="danger" className="w-full" onClick={() => act('cancel', true)}>Cancel</Button>
                            </>
                        )}
                        {r.status === 'approved' && (
                            <>
                                <Button className="w-full" onClick={() => act('process')}>Start processing</Button>
                                <Button className="w-full" variant="outline" onClick={() => act('complete', false, 'Credit payout to member wallet and run upline commissions?')}>
                                    Complete & credit
                                </Button>
                            </>
                        )}
                        {r.status === 'processing' && (
                            <Button className="w-full" onClick={() => act('complete', false, 'Credit payout to member wallet and run upline commissions?')}>
                                Complete & credit
                            </Button>
                        )}
                        {r.status === 'completed' && (
                            <Button variant="danger" className="w-full" onClick={() => act('reverse', true)}>
                                Reverse (debit wallet)
                            </Button>
                        )}
                        {!['pending', 'eligible', 'approved', 'processing', 'completed'].includes(r.status) && (
                            <p className="text-sm text-gray-500">Finalized — no actions available.</p>
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
