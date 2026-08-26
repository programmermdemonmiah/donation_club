import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface FundDetail {
    id: number;
    reference: string;
    requested_amount: string;
    approved_amount?: string | null;
    purpose: string;
    status: string;
    decision_note?: string | null;
    created_at: string;
    disbursed_at?: string | null;
    user?: { id: number; name: string; email: string } | null;
    fund?: { id: number; name: string } | null;
}

export default function AdminFundShow() {
    const page = usePage<PageProps & { request: FundDetail }>();
    const r = page.props.request;

    const act = (action: string, fields: Record<string, string> = {}, confirmMsg?: string) => {
        if (confirmMsg && !window.confirm(confirmMsg)) return;
        router.post(route(`admin.funds.${action}`, r.id), fields, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Fund request {r.reference}</h1>
                    <p className="text-sm text-gray-500">
                        {r.user ? (
                            <a href={route('admin.users.show', r.user.id)} className="text-indigo-600 hover:text-indigo-500">{r.user.name}</a>
                        ) : '—'}{' '}
                        · {r.fund?.name} · {formatDateTime(r.created_at)}
                    </p>
                </div>
                <Badge value={r.status} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader title="Details" />
                    <CardBody className="space-y-2.5 text-sm">
                        <Row label="Requested amount" value={formatMoney(r.requested_amount)} strong />
                        {r.approved_amount && <Row label="Approved amount" value={formatMoney(r.approved_amount)} strong />}
                        <Row label="Disbursed at" value={formatDateTime(r.disbursed_at)} />
                        {r.decision_note && <Row label="Decision note" value={r.decision_note} />}
                        <div className="my-2 border-t border-gray-100" />
                        <p className="rounded-lg bg-gray-50 p-4 leading-relaxed text-gray-700">{r.purpose}</p>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Review actions" />
                    <CardBody className="space-y-3">
                        {r.status === 'pending' && <ApproveForm onApprove={(amount, note) => act('approve', { approved_amount: amount, note })} />}
                        {(r.status === 'pending' || r.status === 'approved') && (
                            <Button variant="danger" className="w-full" onClick={() => {
                                const reason = window.prompt('Rejection reason:');
                                if (!reason || reason.length < 5) { alert('Min 5 characters.'); return; }
                                act('reject', { reason });
                            }}>
                                Reject
                            </Button>
                        )}
                        {r.status === 'approved' && <Button className="w-full" onClick={() => act('process')}>Move to processing</Button>}
                        {(r.status === 'processing' || r.status === 'approved') && (
                            <Button className="w-full" onClick={() => act('complete', {}, `Disburse to member wallet?`)}>
                                Disburse & complete
                            </Button>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AdminLayout>
    );
}

function ApproveForm({ onApprove }: { onApprove: (amount: string, note: string) => void }) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onApprove(String(fd.get('amount') ?? ''), String(fd.get('note') ?? ''));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-indigo-50/60 p-4 ring-1 ring-inset ring-indigo-600/10">
            <Input name="amount" label="Approved amount" type="number" step="0.01" min="0.01" required />
            <Input name="note" label="Note (optional)" placeholder="e.g. verified employment plan" />
            <Button type="submit" className="w-full">Approve</Button>
        </form>
    );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-xs capitalize text-gray-500">{label.replace(/_/g, ' ')}</dt>
            <dd className={`max-w-[60%] break-words text-right ${strong ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>{value}</dd>
        </div>
    );
}
