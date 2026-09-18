import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { formatMoney } from '@/utils/format';
import type { PageProps } from '@/types';

interface ReferralRow { id: number; name: string; joined_at: string; rank?: string; status: string; }
interface HandLeader { hand: number; username: string | null; }
interface HandProgress { key: string; label: string; value: string; actual: string; met: boolean; }
interface HandRankRow { id: number; name: string; color: string; hands: Array<HandProgress | null>; }

const HAND_LABELS = ['1st Hand', '2nd Hand', '3rd Hand'];

export default function Referrals() {
    const page = usePage<PageProps & {
        referralCode: string; referralLink: string;
        directCount: number; teamSize: number;
        hands: HandLeader[];
        handRanks: HandRankRow[];
        directReferrals: { data: ReferralRow[]; current_page: number; last_page: number };
    }>();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(page.props.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Your Network</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Referrals</h1>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                {[
                    { label: 'Direct Referrals', value: page.props.directCount, icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
                    { label: 'Total Team Size', value: page.props.teamSize, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                            </svg>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Referral link */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Your Referral Link</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="rounded-xl bg-blue-50 p-4 text-center ring-1 ring-blue-200/50">
                            <p className="font-mono text-xl font-black tracking-[0.25em] text-blue-700">{page.props.referralCode}</p>
                        </div>
                        <input
                            readOnly value={page.props.referralLink}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-mono text-gray-500 focus:outline-none"
                        />
                        <button
                            onClick={copy}
                            className={`group relative w-full overflow-hidden rounded-xl py-3 text-sm font-black transition-all duration-300 ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:bg-blue-500'}`}
                        >
                            <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                            {copied ? '✓ Copied!' : 'Copy Invite Link'}
                        </button>
                    </div>
                </div>

                {/* Hands */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
                    <div className="border-b border-gray-50 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Hands</h2>
                        <p className="mt-0.5 text-xs text-gray-400">Each rank fills from zero. Extra above a filled hand counts toward the next rank.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Rank
                                    </th>
                                    {HAND_LABELS.map((label, index) => (
                                        <th key={label} scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            <span className="block">{label}</span>
                                            <span className={`mt-1 block text-sm font-black normal-case tracking-normal ${page.props.hands[index]?.username ? 'text-gray-900' : 'text-gray-300'}`}>
                                                {page.props.hands[index]?.username ? `@${page.props.hands[index].username}` : '—'}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {page.props.handRanks.map((rank) => (
                                    <tr key={rank.id} className="hover:bg-gray-50/70">
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className="flex items-center gap-2.5 text-sm font-black text-gray-900">
                                                <span className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: rank.color }} />
                                                {rank.name}
                                            </span>
                                        </td>
                                        {rank.hands.map((hand, index) => (
                                            <td key={`${rank.id}-${index}`} className="whitespace-nowrap px-4 py-3 text-center">
                                                {hand ? (
                                                    <span className={`font-mono text-xs font-semibold ${hand.met ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                        {formatMoney(hand.actual)} / {formatMoney(hand.value)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Direct referrals table */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-50 px-6 py-4">
                    <h2 className="text-sm font-black text-gray-900">Direct Referrals</h2>
                </div>
                <Table<ReferralRow>
                    columns={[
                        { header: 'Name', render: (r) => (
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">{r.name.charAt(0).toUpperCase()}</span>
                                <span className="font-semibold text-gray-900">{r.name}</span>
                            </div>
                        )},
                        { header: 'Rank', render: (r) => <span className="font-semibold text-gray-600">{r.rank ?? '—'}</span> },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Joined', render: (r) => <span className="text-xs text-gray-400">{r.joined_at}</span> },
                    ]}
                    rows={page.props.directReferrals.data}
                    rowKey={(r) => r.id}
                />
                <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
                    <Pagination currentPage={page.props.directReferrals.current_page} lastPage={page.props.directReferrals.last_page} />
                </div>
            </div>
        </AppLayout>
    );
}
