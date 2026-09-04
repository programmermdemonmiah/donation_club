import AppLayout from '@/layouts/AppLayout';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface ReturnRow {
    id: number;
    reference: string;
    deposit_reference?: string;
    sequence_number?: number | null;
    base_amount: string;
    rate: string;
    payout_amount: string;
    status: string;
    completed_at: string | null;
    created_at: string;
}

function formatSerial(n?: number | null): string {
    if (n == null) return '—';
    return '#' + String(n).padStart(6, '0');
}

const STATUS_TIMELINE = [
    { key: 'pending',    label: 'Pending' },
    { key: 'eligible',   label: 'Eligible' },
    { key: 'approved',   label: 'Approved' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed',  label: 'Completed' },
];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
    const activeIndex = STATUS_TIMELINE.findIndex(s => s.key === currentStatus);
    if (activeIndex === -1) return null;
    return (
        <div className="flex items-center">
            {STATUS_TIMELINE.map((step, i) => {
                const isPast    = i < activeIndex;
                const isCurrent = i === activeIndex;
                return (
                    <div key={step.key} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                                isPast    ? 'bg-emerald-500 text-white'  :
                                isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                                            'bg-gray-100 text-gray-400'
                            }`}>
                                {isPast ? '✓' : i + 1}
                            </div>
                            <span className={`mt-1 whitespace-nowrap text-[9px] font-semibold ${
                                isCurrent ? 'text-blue-600' : isPast ? 'text-emerald-600' : 'text-gray-300'
                            }`}>{step.label}</span>
                        </div>
                        {i < STATUS_TIMELINE.length - 1 && (
                            <div className={`mb-4 h-[2px] w-8 ${isPast ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function Returns() {
    const page = usePage<PageProps & {
        returns: { data: ReturnRow[]; current_page: number; last_page: number };
        eligibility: { eligible: boolean; failed: Array<{ requirement: string; required: string; actual: string }> };
        termsNote?: string | null;
    }>();
    const { returns, eligibility, termsNote } = page.props;
    const hasReturns = returns.data.length > 0;

    return (
        <AppLayout>
            {/* Page Header */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Return Payout</p>
                    <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Community Support Returns</h1>
                    <p className="mt-2 max-w-xl text-sm font-medium text-gray-500">
                        Every donation earns a <strong className="text-gray-700">2× return</strong> — donate $1, get $2 back.
                        Returns are paid out in serial queue order by the administrator.
                    </p>
                </div>
                <span className={`mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black shadow-sm ${
                    eligibility.eligible ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                    {eligibility.eligible ? '✓ Eligible — awaiting administrator' : '⏳ Not yet eligible'}
                </span>
            </div>

            {/* Payout Ratio Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { emoji: '💵', label: 'You Donate',  value: '$1.00', sub: 'Per donation cycle' },
                    { emoji: '➡️', label: 'Return Rate', value: '200%',  sub: '2× your donated amount' },
                    { emoji: '💸', label: 'You Receive', value: '$2.00', sub: 'Credited to your wallet' },
                ].map(card => (
                    <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                        <span className="text-3xl">{card.emoji}</span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.label}</p>
                            <p className="text-2xl font-black text-gray-900">{card.value}</p>
                            <p className="text-xs text-gray-400">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Eligibility Checklist */}
            {!eligibility.eligible && eligibility.failed.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
                    <div className="border-b border-amber-100 bg-amber-100/60 px-6 py-4">
                        <h2 className="text-sm font-black text-amber-900">Eligibility Requirements</h2>
                        <p className="mt-0.5 text-xs text-amber-700">Complete these requirements to qualify for a payout</p>
                    </div>
                    <ul className="divide-y divide-amber-100 px-6">
                        {eligibility.failed.map((item) => (
                            <li key={item.requirement} className="flex items-center justify-between py-3.5">
                                <div className="flex items-center gap-2.5">
                                    <span>⚠️</span>
                                    <span className="text-sm font-semibold text-amber-900">{item.requirement}</span>
                                </div>
                                <span className="text-xs text-amber-700">
                                    Need <strong className="text-amber-900">{item.required}</strong>
                                    {' · '}Yours <strong className="text-blue-600">{item.actual}</strong>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Terms Note */}
            {termsNote && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200/50 bg-blue-50 p-5">
                    <span className="mt-0.5 text-lg">ℹ️</span>
                    <p className="text-sm font-semibold text-blue-900">{termsNote}</p>
                </div>
            )}

            {/* Returns Queue */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
                    <div>
                        <h2 className="text-sm font-black text-gray-900">Return Queue</h2>
                        <p className="mt-0.5 text-xs text-gray-400">Listed in serial queue order — earliest donations get paid first</p>
                    </div>
                    {hasReturns && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                            {returns.data.length} record{returns.data.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {!hasReturns ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <span className="text-5xl">📋</span>
                        <p className="mt-4 text-base font-bold text-gray-700">No return records yet</p>
                        <p className="mt-1 max-w-xs text-sm text-gray-400">
                            Return records are created automatically when you make a donation and the community support module is active.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {returns.data.map((r, index) => (
                            <div key={r.id} className="px-6 py-5">
                                {/* Row Header */}
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
                                            {(returns.current_page - 1) * 10 + index + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-gray-700">{r.reference}</span>
                                                <Badge value={r.status} />
                                            </div>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                Donated on {formatDateTime(r.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Return Payout</p>
                                        <p className="text-2xl font-black text-emerald-600">{formatMoney(r.payout_amount)}</p>
                                        <p className="text-xs text-gray-400">
                                            {formatMoney(r.base_amount)} × {Number(r.rate) ? `${Number(r.rate)}%` : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Serial Number + Deposit Info */}
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    {/* Serial Number — the primary queue identifier */}
                                    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">Queue Serial</span>
                                        <span className="font-mono text-lg font-black text-blue-700">
                                            {formatSerial(r.sequence_number)}
                                        </span>
                                    </div>
                                    {r.deposit_reference && (
                                        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Donation Ref</span>
                                            <span className="font-mono text-sm font-bold text-gray-700">{r.deposit_reference}</span>
                                        </div>
                                    )}
                                    {r.completed_at && (
                                        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Paid On</span>
                                            <span className="text-sm font-bold text-emerald-700">{formatDateTime(r.completed_at)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status Timeline */}
                                {!['cancelled', 'reversed'].includes(r.status) && (
                                    <div className="mt-4 overflow-x-auto">
                                        <StatusTimeline currentStatus={r.status} />
                                    </div>
                                )}
                                {r.status === 'cancelled' && (
                                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5">
                                        <span>❌</span>
                                        <span className="text-sm font-semibold text-rose-700">This return was cancelled by the administrator.</span>
                                    </div>
                                )}
                                {r.status === 'reversed' && (
                                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5">
                                        <span>↩️</span>
                                        <span className="text-sm font-semibold text-orange-700">This payout was reversed by the administrator.</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {returns.last_page > 1 && (
                    <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                        <Pagination currentPage={returns.current_page} lastPage={returns.last_page} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


