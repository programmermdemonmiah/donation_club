import PublicLayout from '@/layouts/PublicLayout';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/format';

interface DepositRow {
    sequence_number: number;
    formatted: string;
    amount: string;
    completed_at: string | null;
    donor_name: string;
    donor_initial: string;
}

export default function PublicDeposits() {
    const page = usePage<{ deposits: { data: DepositRow[]; current_page: number; last_page: number } }>();
    const { data, current_page, last_page } = page.props.deposits;

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-blue-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950"></div>
                <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
                <div className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]"></div>
                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-5 py-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                        </span>
                        <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Live Donation Ledger</span>
                    </div>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Public Donation Ledger</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-blue-100/70">
                        Every confirmed donation — donor name, amount and permanent sequence number — displayed in list order for full transparency.
                    </p>
                </div>
            </section>

            {/* Ledger Table */}
            <section className="bg-white py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
                        {/* Table Header */}
                        <div className="hidden grid-cols-[90px_1fr_140px_140px_110px] items-center border-b border-gray-100 bg-gradient-to-r from-blue-50 to-emerald-50/40 px-6 py-4 sm:grid">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-600">Sequence</span>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">Donor</span>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-600">Donation</span>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Date</span>
                            <span className="text-right text-xs font-black uppercase tracking-widest text-gray-500">Status</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-emerald-50/40 px-6 py-4 sm:hidden">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-600">Donations List</span>
                            <span className="text-xs font-semibold text-gray-400">{data.length} records</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-50">
                            {data.length === 0 && (
                                <div className="px-6 py-24 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 shadow-lg">
                                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="mt-4 text-base font-bold text-gray-700">No completed donations yet.</p>
                                    <p className="mt-1 text-sm font-medium text-gray-400">The public donor list will appear here once members donate.</p>
                                </div>
                            )}
                            {data.map((deposit) => (
                                <div
                                    key={deposit.sequence_number}
                                    className="grid grid-cols-1 gap-3 px-6 py-4 transition-colors hover:bg-blue-50/30 sm:grid-cols-[90px_1fr_140px_140px_110px] sm:items-center sm:gap-0"
                                >
                                    {/* Sequence */}
                                    <div className="flex items-center gap-3 sm:gap-0">
                                        <span className="font-mono text-xs font-black tracking-wider text-blue-600">{deposit.formatted}</span>
                                        <span className="text-xs text-gray-300 sm:hidden">·</span>
                                        <span className="text-xs font-medium text-gray-400 sm:hidden">Donor</span>
                                    </div>

                                    {/* Donor - which person */}
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-xs font-black text-white shadow-sm ring-1 ring-white">
                                            {deposit.donor_initial}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-gray-900">{deposit.donor_name}</p>
                                            <p className="hidden text-xs font-medium text-gray-400 sm:block">Donor</p>
                                        </div>
                                    </div>

                                    {/* Amount - which amount */}
                                    <div className="flex items-center justify-between sm:block">
                                        <span className="text-xs font-semibold text-gray-400 sm:hidden">Donation Amount</span>
                                        <span className="text-base font-black tabular-nums text-emerald-600">
                                            ${Number(deposit.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center justify-between sm:block">
                                        <span className="text-xs font-semibold text-gray-400 sm:hidden">Date</span>
                                        <span className="text-sm font-medium text-gray-600">{formatDate(deposit.completed_at)}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="flex justify-between sm:justify-end">
                                        <span className="text-xs font-semibold text-gray-400 sm:hidden">Status</span>
                                        <span className="inline-flex h-fit items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60">
                                            ● Donated
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-4">
                            <Pagination currentPage={current_page} lastPage={last_page} />
                            <p className="mt-3 text-center text-xs font-medium text-gray-400">
                                Showing donor name and donation amount for each completed entry — newest first.
                            </p>
                        </div>
                    </div>

                    {/* Info card */}
                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                        <div className="flex gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-sm font-bold text-blue-900">Transparency Note</p>
                                <p className="mt-1 text-sm font-medium leading-relaxed text-blue-700/80">
                                    This public list shows <span className="font-black text-blue-900">which person</span> donated <span className="font-black text-blue-900">which amount</span> in list order. Only donor name, donation amount and sequence are public. Email, address and private data are never displayed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
