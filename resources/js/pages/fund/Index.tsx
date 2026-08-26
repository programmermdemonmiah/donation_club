import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface FundEntry {
    id: number;
    name: string;
    description?: string | null;
    min_amount: string;
    max_amount: string;
    requires_proof: boolean;
    minimum_rank?: { name: string; level: number } | null;
    eligible: boolean;
}

interface RequestRow {
    id: number;
    reference: string;
    fund?: string;
    requested_amount: string;
    approved_amount?: string | null;
    status: string;
    decision_note?: string | null;
    created_at: string;
}

export default function Fund() {
    const page = usePage<
        PageProps & {
            funds: FundEntry[];
            requests: { data: RequestRow[]; current_page: number; last_page: number };
        }
    >();
    const [selectedFund, setSelectedFund] = useState<FundEntry | null>(null);

    const form = useForm({
        fund_id: 0,
        amount: '',
        purpose: '',
        proof: null as File | null,
    });

    const openForm = (fund: FundEntry) => {
        form.setData('fund_id', fund.id);
        form.setData('amount', String(parseFloat(fund.min_amount)));
        setSelectedFund(fund);
    };

    const close = () => setSelectedFund(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('fund-requests.store'), {
            forceFormData: true,
            onSuccess: () => setSelectedFund(null),
        });
    };

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Employment / Support Fund</h1>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {page.props.funds.map((fund) => (
                    <Card key={fund.id}>
                        <CardHeader
                            title={fund.name}
                            subtitle={fund.minimum_rank ? `Requires rank: ${fund.minimum_rank.name}` : 'No rank requirement'}
                        />
                        <CardBody className="space-y-3">
                            {fund.description && <p className="text-sm text-gray-600">{fund.description}</p>}
                            <p className="text-sm">
                                Range: <strong>{formatMoney(fund.min_amount)} – {formatMoney(fund.max_amount)}</strong>
                            </p>
                            {fund.requires_proof && <p className="text-xs text-gray-400">Supporting document required.</p>}
                            {fund.eligible ? (
                                <Button onClick={() => openForm(fund)} className="w-full">
                                    Request support
                                </Button>
                            ) : (
                                <Button disabled variant="secondary" className="w-full">
                                    Requires {fund.minimum_rank?.name} rank
                                </Button>
                            )}
                        </CardBody>
                    </Card>
                ))}
                {page.props.funds.length === 0 && (
                    <p className="col-span-full py-10 text-center text-sm text-gray-500">No funds are currently accepting requests.</p>
                )}
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">My requests</h2>
                </div>
                <Table<RequestRow>
                    columns={[
                        { header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.reference}</span> },
                        { header: 'Fund', render: (r) => r.fund ?? '—' },
                        { header: 'Requested', render: (r) => formatMoney(r.requested_amount) },
                        { header: 'Approved', render: (r) => (r.approved_amount ? formatMoney(r.approved_amount) : '—') },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Note', render: (r) => <span className="max-w-[200px] truncate text-xs text-gray-500">{r.decision_note}</span> },
                        { header: 'Date', render: (r) => formatDateTime(r.created_at) },
                    ]}
                    rows={page.props.requests.data}
                    rowKey={(r) => r.id}
                    emptyMessage="You haven't requested any support yet."
                />
                <Pagination currentPage={page.props.requests.current_page} lastPage={page.props.requests.last_page} />
            </div>

            <Modal open={!!selectedFund} onClose={close} title={`Request — ${selectedFund?.name ?? ''}`}>
                <form onSubmit={submit} className="space-y-4">
                    <Input
                        label="Amount (USD)"
                        type="number"
                        step="0.01"
                        min={selectedFund ? parseFloat(selectedFund.min_amount) : undefined}
                        max={selectedFund ? parseFloat(selectedFund.max_amount) : undefined}
                        value={form.data.amount}
                        onChange={(e) => form.setData('amount', e.target.value)}
                        error={form.errors.amount as string | undefined}
                        required
                    />
                    <Textarea
                        label="Purpose (min 20 characters)"
                        value={form.data.purpose}
                        onChange={(e) => form.setData('purpose', e.target.value)}
                        error={form.errors.purpose as string | undefined}
                        required
                    />
                    {selectedFund?.requires_proof && (
                        <Input
                            label="Proof document (PDF/JPG/PNG)"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => form.setData('proof', e.target.files?.[0] ?? null)}
                            error={form.errors.proof as string | undefined}
                        />
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={close}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={form.processing}>
                            Submit request
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
