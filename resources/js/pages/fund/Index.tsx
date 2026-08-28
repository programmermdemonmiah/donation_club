import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface FundEntry {
    id: number; name: string; description?: string | null;
    min_amount: string; max_amount: string; requires_proof: boolean;
    minimum_rank?: { name: string; level: number } | null; eligible: boolean;
}
interface RequestRow {
    id: number; reference: string; fund?: string; requested_amount: string;
    approved_amount?: string | null; status: string; decision_note?: string | null; created_at: string;
}

export default function Fund() {
    const page = usePage<PageProps & {
        funds: FundEntry[];
        requests: { data: RequestRow[]; current_page: number; last_page: number };
    }>();
    const [selectedFund, setSelectedFund] = useState<FundEntry | null>(null);

    const form = useForm({ fund_id: 0, amount: '', purpose: '', proof: null as File | null });

    const openForm = (fund: FundEntry) => { form.setData('fund_id', fund.id); form.setData('amount', String(parseFloat(fund.min_amount))); setSelectedFund(fund); };
    const close = () => setSelectedFund(null);
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post(route('fund-requests.store'), { forceFormData: true, onSuccess: () => setSelectedFund(null) }); };

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Community Aid</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Support Fund</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">Apply for community support funds that you are eligible for.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {page.props.funds.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
                        <svg className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5" /></svg>
                        <p className="mt-3 text-sm font-semibold text-gray-400">No funds available right now.</p>
                    </div>
                )}
                {page.props.funds.map((fund) => (
                    <div key={fund.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
                        <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                            <h2 className="text-sm font-black text-gray-900">{fund.name}</h2>
                            <p className="mt-0.5 text-xs font-medium text-gray-400">
                                {fund.minimum_rank ? `Requires rank: ${fund.minimum_rank.name}` : 'No rank requirement'}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            {fund.description && <p className="text-sm font-medium text-gray-600">{fund.description}</p>}
                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Amount Range</span>
                                <span className="text-sm font-black text-gray-900">{formatMoney(fund.min_amount)} – {formatMoney(fund.max_amount)}</span>
                            </div>
                            {fund.requires_proof && (
                                <p className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    Supporting document required
                                </p>
                            )}
                            {fund.eligible ? (
                                <button onClick={() => openForm(fund)}
                                    className="group relative w-full overflow-hidden rounded-xl bg-amber-500 py-2.5 text-sm font-black text-gray-900 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all hover:bg-amber-400">
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    Request Support
                                </button>
                            ) : (
                                <button disabled className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-black text-gray-400 cursor-not-allowed">
                                    Requires {fund.minimum_rank?.name ?? 'higher'} rank
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-50 px-6 py-4">
                    <h2 className="text-sm font-black text-gray-900">My Requests</h2>
                </div>
                <Table<RequestRow>
                    columns={[
                        { header: 'Reference', render: (r) => <span className="font-mono text-xs font-bold text-gray-700">{r.reference}</span> },
                        { header: 'Fund', render: (r) => <span className="font-semibold text-gray-700">{r.fund ?? '—'}</span> },
                        { header: 'Requested', render: (r) => <span className="font-black text-gray-900">{formatMoney(r.requested_amount)}</span> },
                        { header: 'Approved', render: (r) => <span className="font-black text-emerald-600">{r.approved_amount ? formatMoney(r.approved_amount) : '—'}</span> },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Date', render: (r) => <span className="text-xs text-gray-400">{formatDateTime(r.created_at)}</span> },
                    ]}
                    rows={page.props.requests.data}
                    rowKey={(r) => r.id}
                    emptyMessage="You haven't requested any support yet."
                />
                <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                    <Pagination currentPage={page.props.requests.current_page} lastPage={page.props.requests.last_page} />
                </div>
            </div>

            <Modal open={!!selectedFund} onClose={close} title={`Request — ${selectedFund?.name ?? ''}`}>
                <form onSubmit={submit} className="space-y-4">
                    {[
                        { label: `Amount (${selectedFund ? `$${parseFloat(selectedFund.min_amount)}–$${parseFloat(selectedFund.max_amount)}` : ''})`, key: 'amount', type: 'number', min: selectedFund?.min_amount, max: selectedFund?.max_amount },
                    ].map(({ label, key, type, min, max }) => (
                        <div key={key} className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">{label}</label>
                            <input type={type} step="0.01" min={min} max={max} value={(form.data as any)[key]} onChange={(e) => form.setData(key as any, e.target.value)} required
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20" />
                            {(form.errors as any)[key] && <p className="text-xs font-semibold text-red-600">{(form.errors as any)[key]}</p>}
                        </div>
                    ))}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-gray-700">Purpose (min 20 characters)</label>
                        <textarea rows={4} value={form.data.purpose} onChange={(e) => form.setData('purpose', e.target.value)} required
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20" />
                        {form.errors.purpose && <p className="text-xs font-semibold text-red-600">{form.errors.purpose as string}</p>}
                    </div>
                    {selectedFund?.requires_proof && (
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">Proof document (PDF/JPG/PNG)</label>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => form.setData('proof', e.target.files?.[0] ?? null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-amber-700 hover:file:bg-amber-100" />
                            {form.errors.proof && <p className="text-xs font-semibold text-red-600">{form.errors.proof as string}</p>}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={close} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={form.processing}
                            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-gray-900 hover:bg-amber-400 disabled:opacity-60">
                            {form.processing ? 'Submitting…' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
