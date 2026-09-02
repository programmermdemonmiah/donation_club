import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface WithdrawalRow {
    id: number; reference: string; amount: string; fee: string;
    net_amount: string; method: string; status: string;
    admin_note?: string | null; created_at: string;
}

export default function Withdrawals() {
    const page = usePage<PageProps & {
        availableBalance: string;
        withdrawals: { data: WithdrawalRow[]; current_page: number; last_page: number };
        rules: { min: string; max: string; fee_percent: string; enabled: boolean };
    }>();
    const [cancelId, setCancelId] = useState<number | null>(null);
    const form = useForm({ amount: page.props.rules.min, method: 'bank', account_name: '', account_details: '' });

    const amountNum = parseFloat(form.data.amount || '0');
    const feePercent = parseFloat(page.props.rules.fee_percent || '0');
    const estimatedFee = (amountNum * feePercent) / 100;
    const estimatedNet = Math.max(0, amountNum - estimatedFee);

    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post(route('withdrawals.store')); };

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Cash Out</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Withdrawals</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">
                    Available balance: <span className="font-black text-emerald-600">{formatMoney(page.props.availableBalance)}</span>
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">New Withdrawal</h2>
                    </div>
                    <div className="p-6">
                        {!page.props.rules.enabled ? (
                            <div className="rounded-xl border border-blue-200/50 bg-blue-50 p-4">
                                <p className="text-sm font-semibold text-blue-800">Withdrawals are temporarily disabled by the club.</p>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="space-y-4">
                                {[
                                    { label: `Amount ($${page.props.rules.min}–$${page.props.rules.max})`, key: 'amount', type: 'number', props: { step: '0.01', min: page.props.rules.min, max: page.props.rules.max } },
                                    { label: 'Account Holder Name', key: 'account_name', type: 'text' },
                                    { label: 'Account Details (bank/number/branch)', key: 'account_details', type: 'text', props: { placeholder: 'Bank / account number / branch…' } },
                                ].map(({ label, key, type, props: extra }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700">{label}</label>
                                        <input
                                            type={type} {...(extra as any)}
                                            value={(form.data as any)[key]}
                                            onChange={(e) => form.setData(key as any, e.target.value)}
                                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                                        />
                                        {(form.errors as any)[key] && <p className="text-xs font-semibold text-red-600">{(form.errors as any)[key]}</p>}
                                    </div>
                                ))}

                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Method</label>
                                    <select
                                        value={form.data.method}
                                        onChange={(e) => form.setData('method', e.target.value)}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                                    >
                                        <option value="bank">Bank Transfer</option>
                                    </select>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span>Fee ({page.props.rules.fee_percent}%)</span>
                                        <span className="text-rose-500">−${estimatedFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm font-black text-gray-900">
                                        <span>You receive</span>
                                        <span className="text-emerald-600">${estimatedNet.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={form.processing}
                                    className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all hover:bg-blue-500 disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    {form.processing ? 'Processing…' : 'Request Withdrawal'}
                                </button>
                                <p className="text-xs text-gray-400 text-center">Amount is locked immediately while administrators review your request.</p>
                            </form>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
                    <div className="border-b border-gray-50 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Withdrawal History</h2>
                    </div>
                    <Table<WithdrawalRow>
                        columns={[
                            { header: 'Reference', render: (w) => <span className="font-mono text-xs font-bold text-gray-700">{w.reference}</span> },
                            { header: 'Amount', render: (w) => <span className="font-black text-gray-900">{formatMoney(w.amount)}</span> },
                            { header: 'Fee', render: (w) => <span className="text-rose-500 font-semibold">−{formatMoney(w.fee)}</span> },
                            { header: 'Net', render: (w) => <span className="font-black text-emerald-600">{formatMoney(w.net_amount)}</span> },
                            { header: 'Status', render: (w) => <Badge value={w.status} /> },
                            {
                                header: '',
                                render: (w) => w.status === 'pending' ? (
                                    <button onClick={() => setCancelId(w.id)} className="text-xs font-bold text-rose-500 hover:text-rose-600">Cancel</button>
                                ) : null,
                            },
                            { header: 'Requested', render: (w) => <span className="text-xs text-gray-400">{formatDateTime(w.created_at)}</span> },
                        ]}
                        rows={page.props.withdrawals.data}
                        rowKey={(w) => w.id}
                        emptyMessage="No withdrawals yet."
                    />
                    <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                        <Pagination currentPage={page.props.withdrawals.current_page} lastPage={page.props.withdrawals.last_page} />
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={cancelId !== null}
                onClose={() => setCancelId(null)}
                onConfirm={() => { if (cancelId !== null) router.delete(route('withdrawals.cancel', cancelId), { onFinish: () => setCancelId(null) }); }}
                title="Cancel withdrawal"
                message="The locked amount will be released back to your available balance."
                confirmLabel="Cancel request"
                danger
            />
        </AppLayout>
    );
}
