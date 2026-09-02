import AppLayout from '@/layouts/AppLayout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate, formatMoney } from '@/utils/format';

interface RequirementRow { key: string; label: string; value: string; actual: string; met: boolean; }
interface RankEntry { id: number; name: string; level: number; color: string; is_current: boolean; requirements: RequirementRow[]; }
interface HistoryRow { old: string | null; new: string | null; reason?: string; at: string; }

export default function Rank() {
    const page = usePage<PageProps & {
        currentRank: { name: string; color: string } | null;
        metrics: Record<string, string | number>;
        ladder: RankEntry[];
        history: HistoryRow[];
    }>();

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Achievement</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Rank Progress</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Current rank */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Your Current Rank</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        {page.props.currentRank ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl py-6 text-center text-white shadow-lg"
                                style={{ backgroundColor: page.props.currentRank.color, boxShadow: `0 10px 40px ${page.props.currentRank.color}55` }}>
                                <svg className="mb-2 h-10 w-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172" /></svg>
                                <span className="text-xl font-black">{page.props.currentRank.name}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-8 text-center">
                                <p className="text-sm font-semibold text-gray-400">No rank yet</p>
                                <p className="mt-1 text-xs text-gray-300">Build your team to unlock ranks</p>
                            </div>
                        )}

                        <div className="space-y-3 border-t border-gray-50 pt-4">
                            {[
                                { label: 'Direct Referrals', key: 'direct_referrals' },
                                { label: 'Team Size', key: 'team_size' },
                                { label: 'Team Volume', key: 'team_volume', isMoney: true },
                                { label: 'Qualified Members', key: 'qualified_members' },
                            ].map(({ label, key, isMoney }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">{label}</span>
                                    <span className="text-sm font-black text-gray-900">
                                        {isMoney ? formatMoney(page.props.metrics[key]) : page.props.metrics[key]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rank ladder */}
                <div className="grid gap-4 content-start lg:col-span-3 sm:grid-cols-2 xl:grid-cols-3">
                    {page.props.ladder.map((rank) => (
                        <div key={rank.id} className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 ${rank.is_current ? 'border-blue-500 shadow-blue-100' : 'border-gray-100 hover:border-gray-200'}`}>
                            {rank.is_current && (
                                <div className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                                    CURRENT
                                </div>
                            )}
                            <div className="mb-4 flex items-center gap-2.5">
                                <span className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: rank.color }} />
                                <span className="text-sm font-black text-gray-900">{rank.name}</span>
                            </div>
                            <ul className="space-y-2">
                                {rank.requirements.length === 0 && (
                                    <li className="text-xs font-medium italic text-gray-400">Entry level — no requirements</li>
                                )}
                                {rank.requirements.map((req) => (
                                    <li key={req.key} className="flex items-center justify-between">
                                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${req.met ? 'text-emerald-600' : 'text-gray-500'}`}>
                                            <span className={`h-2 w-2 rounded-full ${req.met ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                            {req.label}
                                        </span>
                                        <span className="font-mono text-xs text-gray-400">{req.actual}/{req.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-50 px-6 py-4">
                    <h2 className="text-sm font-black text-gray-900">Rank History</h2>
                </div>
                <div className="divide-y divide-gray-50 px-6">
                    {page.props.history.length === 0 ? (
                        <p className="py-8 text-center text-sm font-medium text-gray-400">No rank changes recorded yet.</p>
                    ) : (
                        page.props.history.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between py-3.5">
                                <span className="text-sm font-semibold text-gray-700">
                                    <span className="text-gray-400">{entry.old ?? 'None'}</span>
                                    <span className="mx-2 text-gray-300">→</span>
                                    <span className="font-black text-blue-600">{entry.new ?? '—'}</span>
                                </span>
                                <span className="text-xs text-gray-400">{formatDate(entry.at)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
