import PublicLayout from '@/layouts/PublicLayout';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/format';

interface DepositRow {
    sequence_number: number;
    formatted: string;
    amount: string;
    completed_at: string | null;
}

export default function PublicDeposits() {
    const page = usePage<{ deposits: { data: DepositRow[]; current_page: number; last_page: number } }>();
    const { data, current_page, last_page } = page.props.deposits;

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gray-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"></div>
                <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]"></div>
                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-5 py-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                        </span>
                        <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Live Ledger</span>
                    </div>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Public Deposit Ledger</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400">
                        Every confirmed community contribution, in permanent sequence order. Only amounts and sequence numbers are public — never personal data.
                    </p>
                </div>
            </section>

            {/* Ledger Table */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
                        {/* Table Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Sequence</span>
                            <div className="flex items-center gap-8">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Amount</span>
                                <span className="hidden text-xs font-black uppercase tracking-widest text-gray-500 sm:block">Date</span>
                            </div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-50">
                            {data.length === 0 && (
                                <div className="px-6 py-24 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="mt-4 text-base font-semibold text-gray-500">No completed deposits yet.</p>
                                    <p className="mt-1 text-sm text-gray-400">The ledger will update as members confirm contributions.</p>
                                </div>
                            )}
                            {data.map((deposit, i) => (
                                <div
                                    key={deposit.sequence_number}
                                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-amber-50/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-xs font-black text-gray-400">
                                            {i + 1 + (current_page - 1) * data.length}
                                        </span>
                                        <div>
                                            <p className="font-mono text-sm font-black text-amber-600">{deposit.formatted}</p>
                                            <p className="text-xs font-medium text-gray-400">#{String(deposit.sequence_number).padStart(6, '0')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className="text-base font-black text-gray-900">
                                            ${Number(deposit.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="hidden text-sm font-medium text-gray-400 sm:block">{formatDate(deposit.completed_at)}</span>
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/50">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                            <Pagination currentPage={current_page} lastPage={last_page} />
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
