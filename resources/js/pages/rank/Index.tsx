import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate, formatMoney } from '@/utils/format';

interface RequirementRow {
    key: string;
    label: string;
    value: string;
    actual: string;
    met: boolean;
}

interface RankEntry {
    id: number;
    name: string;
    level: number;
    color: string;
    is_current: boolean;
    requirements: RequirementRow[];
}

interface HistoryRow {
    old: string | null;
    new: string | null;
    reason?: string;
    at: string;
}

export default function Rank() {
    const page = usePage<
        PageProps & {
            currentRank: { name: string; color: string } | null;
            metrics: Record<string, string | number>;
            ladder: RankEntry[];
            history: HistoryRow[];
        }
    >();

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Rank Progress</h1>

            <div className="mt-6 grid gap-6 lg:grid-cols-4">
                <Card className="lg:col-span-1">
                    <CardHeader title="Your current rank" />
                    <CardBody className="space-y-3">
                        {page.props.currentRank ? (
                            <div
                                className="rounded-lg p-4 text-center text-lg font-bold text-white"
                                style={{ backgroundColor: page.props.currentRank.color }}
                            >
                                {page.props.currentRank.name}
                            </div>
                        ) : (
                            <p className="py-4 text-center text-sm text-gray-500">No rank yet</p>
                        )}
                        <dl className="space-y-1.5 pt-2 text-sm">
                            <Metric label="Direct referrals" value={String(page.props.metrics.direct_referrals)} />
                            <Metric label="Team size" value={String(page.props.metrics.team_size)} />
                            <Metric label="Team volume" value={formatMoney(page.props.metrics.team_volume)} />
                            <Metric label="Qualified members" value={String(page.props.metrics.qualified_members)} />
                        </dl>
                    </CardBody>
                </Card>

                <div className="grid gap-4 lg:col-span-3 sm:grid-cols-2 xl:grid-cols-3">
                    {page.props.ladder.map((rank) => (
                        <div
                            key={rank.id}
                            className={`rounded-xl border bg-white p-5 shadow-sm ${rank.is_current ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-semibold text-gray-900">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: rank.color }} />
                                    {rank.name}
                                </span>
                                {rank.is_current && (
                                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">Current</span>
                                )}
                            </div>
                            <ul className="mt-3 space-y-1.5">
                                {rank.requirements.length === 0 && <li className="text-xs italic text-gray-400">Entry level — no requirements</li>}
                                {rank.requirements.map((req) => (
                                    <li key={req.key} className="flex items-center justify-between text-xs">
                                        <span className={req.met ? 'text-emerald-600' : 'text-gray-500'}>
                                            {req.met ? '✓' : '○'} {req.label}
                                        </span>
                                        <span className="font-mono text-gray-400">{req.actual}/{req.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="mt-8">
                <CardHeader title="Rank history" />
                <CardBody>
                    {page.props.history.length === 0 ? (
                        <p className="text-sm text-gray-500">No rank changes recorded yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100 text-sm">
                            {page.props.history.map((entry, i) => (
                                <li key={i} className="flex items-center justify-between py-2.5">
                                    <span>
                                        <strong>{entry.old ?? 'None'}</strong> → <strong className="text-indigo-600">{entry.new ?? '—'}</strong>
                                    </span>
                                    <span className="text-xs text-gray-400">{formatDate(entry.at)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardBody>
            </Card>
        </AppLayout>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="font-semibold text-gray-800">{value}</dd>
        </div>
    );
}
