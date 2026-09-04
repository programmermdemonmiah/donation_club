import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate, formatMoney, formatSequence } from '@/utils/format';

interface DepositRow {
    id: number; reference: string; amount: string;
    status: string; sequence_number: number | null; created_at: string;
}

export default function Deposits() {
    const page = usePage<PageProps & {
        deposits: { data: DepositRow[]; current_page: number; last_page: number };
        eligibility: boolean; eligibilityReason?: string;
        rules: { min: string; max: string };
    }>();
    const { deposits, eligibility, eligibilityReason, rules } = page.props;
    const form = useForm({ amount: rules.min });
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post(route('deposits.store')); };

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Your Contributions</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Deposits</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">
                    Voluntary contributions between <strong className="text-gray-700">${rules.min}</strong> and <strong className="text-gray-700">${rules.max}</strong>.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* New deposit card */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
                    <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Donate from Wallet Balance</h2>
                        <p className="mt-0.5 text-xs font-medium text-gray-400">Amount in USD</p>
                    </div>
                    <div className="p-6">
                        {eligibility ? (
                            <form onSubmit={submit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">
                                        Amount (${rules.min} – ${rules.max})
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-black text-gray-400">$</span>
                                        <input
                                            type="number" step="0.01" min={rules.min} max={rules.max}
                                            value={form.data.amount}
                                            onChange={(e) => form.setData('amount', e.target.value)}
                                            required
                                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-8 pr-4 text-sm font-bold text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                                        />
                                    </div>
                                    {form.errors.amount && <p className="text-xs font-semibold text-red-600">{form.errors.amount}</p>}
                                </div>
                                <button
                                    type="submit" disabled={form.processing}
                                    className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(37,99,235,0.4)] disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    {form.processing ? 'Processing…' : 'Donate Now →'}
                                </button>
                            </form>
                        ) : (
                            <div className="rounded-xl border border-blue-200/50 bg-blue-50 p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm font-semibold text-blue-800">
                                        {eligibilityReason ?? 'Deposits are currently unavailable for your account.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50 lg:col-span-2">
                    <div className="border-b border-gray-50 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Donation History</h2>
                    </div>
                    <Table<DepositRow>
                        columns={[
                            { header: 'Sequence', render: (d) => <span className="font-mono text-xs font-black text-blue-600">{formatSequence(d.sequence_number)}</span> },
                            { header: 'Reference', render: (d) => <Link href={route('deposits.show', d.id)} className="font-mono text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors">{d.reference}</Link> },
                            { header: 'Amount', render: (d) => <span className="font-black text-gray-900">{formatMoney(d.amount)}</span> },
                            { header: 'Status', render: (d) => <Badge value={d.status} /> },
                            { header: 'Date', render: (d) => <span className="text-xs text-gray-400">{formatDate(d.created_at)}</span> },
                        ]}
                        rows={deposits.data}
                        rowKey={(d) => d.id}
                        emptyMessage="No donations yet. Make your first contribution above."
                    />
                    <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                        <Pagination currentPage={deposits.current_page} lastPage={deposits.last_page} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
