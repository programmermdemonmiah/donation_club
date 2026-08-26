import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface WithdrawalRow {
    id: number;
    reference: string;
    amount: string;
    fee: string;
    net_amount: string;
    method: string;
    status: string;
    admin_note?: string | null;
    created_at: string;
}

export default function Withdrawals() {
    const page = usePage<
        PageProps & {
            availableBalance: string;
            withdrawals: { data: WithdrawalRow[]; current_page: number; last_page: number };
            rules: { min: string; max: string; fee_percent: string; enabled: boolean };
        }
    >();
    const [cancelId, setCancelId] = useState<number | null>(null);

    const form = useForm({
        amount: page.props.rules.min,
        method: 'bank',
        account_name: '',
        account_details: '',
    });

    const amountNum = parseFloat(form.data.amount || '0');
    const feePercent = parseFloat(page.props.rules.fee_percent || '0');
    const estimatedFee = (amountNum * feePercent) / 100;
    const estimatedNet = Math.max(0, amountNum - estimatedFee);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('withdrawals.store'));
    };

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Withdrawals</h1>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader
                        title="New withdrawal"
                        subtitle={`Available: ${formatMoney(page.props.availableBalance)}`}
                    />
                    <CardBody>
                        {!page.props.rules.enabled ? (
                            <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
                                Withdrawals are temporarily disabled by the club.
                            </p>
                        ) : (
                            <form onSubmit={submit} className="space-y-4">
                                <Input
                                    label={`Amount (${page.props.rules.min}–${page.props.rules.max})`}
                                    type="number"
                                    step="0.01"
                                    min={page.props.rules.min}
                                    max={page.props.rules.max}
                                    value={form.data.amount}
                                    onChange={(e) => form.setData('amount', e.target.value)}
                                    error={form.errors.amount}
                                    required
                                />
                                <Select
                                    label="Method"
                                    value={form.data.method}
                                    onChange={(e) => form.setData('method', e.target.value)}
                                >
                                    <option value="bank">Bank Transfer</option>
                                </Select>
                                <Input
                                    label="Account holder name"
                                    value={form.data.account_name}
                                    onChange={(e) => form.setData('account_name', e.target.value)}
                                    error={form.errors.account_name as string | undefined}
                                    required
                                />
                                <Input
                                    label="Account details"
                                    placeholder="Bank / account number / branch…"
                                    value={form.data.account_details}
                                    onChange={(e) => form.setData('account_details', e.target.value)}
                                    error={form.errors.account_details as string | undefined}
                                    required
                                />
                                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Fee ({page.props.rules.fee_percent}%)</span>
                                        <span>${estimatedFee.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-1 flex justify-between font-semibold text-gray-800">
                                        <span>You receive</span>
                                        <span>${estimatedNet.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button type="submit" loading={form.processing} className="w-full">
                                    Request withdrawal
                                </Button>
                                <p className="text-xs text-gray-400">
                                    The requested amount is locked immediately while administrators review your request.
                                </p>
                            </form>
                        )}
                    </CardBody>
                </Card>

                <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">History</h2>
                    </div>
                    <Table<WithdrawalRow>
                        columns={[
                            { header: 'Reference', render: (w) => <span className="font-mono text-xs">{w.reference}</span> },
                            { header: 'Amount', render: (w) => formatMoney(w.amount) },
                            { header: 'Fee', render: (w) => formatMoney(w.fee) },
                            { header: 'Net', render: (w) => <strong>{formatMoney(w.net_amount)}</strong> },
                            { header: 'Status', render: (w) => <Badge value={w.status} /> },
                            {
                                header: '',
                                render: (w) =>
                                    w.status === 'pending' ? (
                                        <button onClick={() => setCancelId(w.id)} className="text-xs font-medium text-rose-600 hover:text-rose-500">
                                            Cancel
                                        </button>
                                    ) : null,
                            },
                            { header: 'Requested', render: (w) => formatDateTime(w.created_at) },
                        ]}
                        rows={page.props.withdrawals.data}
                        rowKey={(w) => w.id}
                        emptyMessage="No withdrawals yet."
                    />
                    <Pagination currentPage={page.props.withdrawals.current_page} lastPage={page.props.withdrawals.last_page} />
                </div>
            </div>

            <ConfirmDialog
                open={cancelId !== null}
                onClose={() => setCancelId(null)}
                onConfirm={() => {
                    if (cancelId !== null) {
                        router.delete(route('withdrawals.cancel', cancelId), {
                            onFinish: () => setCancelId(null),
                        });
                    }
                }}
                title="Cancel withdrawal"
                message="The locked amount will be released back to your available balance."
                confirmLabel="Cancel request"
                danger
            />
        </AppLayout>
    );
}
