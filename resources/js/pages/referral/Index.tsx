import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface ReferralRow { id: number; name: string; joined_at: string; rank?: string; status: string; }
interface TreeNode { id: number; name: string; joined_at: string; children: TreeNode[]; }

function Tree({ nodes, depth }: { nodes: TreeNode[]; depth: number }) {
    if (!nodes.length) return null;
    return (
        <ul className={depth === 0 ? 'space-y-1' : 'ml-5 mt-1 space-y-1 border-l-2 border-gray-100 pl-4'}>
            {nodes.map((node) => (
                <li key={node.id}>
                    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700">
                            {node.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{node.name}</span>
                        <span className="text-xs font-medium text-gray-400">since {node.joined_at}</span>
                        {node.children.length > 0 && (
                            <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600">
                                +{node.children.length}
                            </span>
                        )}
                    </div>
                    {node.children.length > 0 && <Tree nodes={node.children} depth={depth + 1} />}
                </li>
            ))}
        </ul>
    );
}

export default function Referrals() {
    const page = usePage<PageProps & {
        referralCode: string; referralLink: string;
        directCount: number; teamSize: number;
        directReferrals: { data: ReferralRow[]; current_page: number; last_page: number };
        tree: TreeNode[];
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Your Network</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Referrals</h1>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                {[
                    { label: 'Direct Referrals', value: page.props.directCount, icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
                    { label: 'Total Team Size', value: page.props.teamSize, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                            <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                        <div className="rounded-xl bg-amber-50 p-4 text-center ring-1 ring-amber-200/50">
                            <p className="font-mono text-xl font-black tracking-[0.25em] text-amber-700">{page.props.referralCode}</p>
                        </div>
                        <input
                            readOnly value={page.props.referralLink}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-mono text-gray-500 focus:outline-none"
                        />
                        <button
                            onClick={copy}
                            className={`group relative w-full overflow-hidden rounded-xl py-3 text-sm font-black transition-all duration-300 ${copied ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:bg-amber-400'}`}
                        >
                            <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                            {copied ? '✓ Copied!' : 'Copy Invite Link'}
                        </button>
                    </div>
                </div>

                {/* Tree */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
                    <div className="border-b border-gray-50 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Referral Tree</h2>
                        <p className="mt-0.5 text-xs text-gray-400">First 3 generations</p>
                    </div>
                    <div className="max-h-80 overflow-auto p-4">
                        {page.props.tree.length === 0 ? (
                            <div className="py-10 text-center">
                                <svg className="mx-auto h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <p className="mt-3 text-sm font-semibold text-gray-500">No referrals yet</p>
                                <p className="mt-1 text-xs text-gray-400">Share your link to start building your team.</p>
                            </div>
                        ) : (
                            <Tree nodes={page.props.tree} depth={0} />
                        )}
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
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-xs font-black text-amber-700">{r.name.charAt(0).toUpperCase()}</span>
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
