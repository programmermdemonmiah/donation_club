import AppLayout from '@/layouts/AppLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface ReturnRow {
    id: number;
    reference: string;
    deposit_reference?: string;
    base_amount: string;
    rate: string;
    payout_amount: string;
    status: string;
    completed_at: string | null;
    created_at: string;
}

export default function Returns() {
    const page = usePage<
        PageProps & {
            returns: { data: ReturnRow[]; current_page: number; last_page: number };
            eligibility: { eligible: boolean; failed: Array<{ requirement: string; required: string; actual: string }> };
            termsNote?: string | null;
        }
    >();

    return (
        <AppLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-gray-900">Returns / Rewards</h1>
                {!page.props.eligibility.eligible && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        Not yet eligible for new returns
                    </span>
                )}
                {page.props.eligibility.eligible && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Eligible — awaiting administrator processing
                    </span>
                )}
            </div>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Returns are discretionary community rewards. There is no fixed payout date; each return requires eligibility and
                explicit administrator approval.
            </p>

            {!page.props.eligibility.eligible && page.props.eligibility.failed.length > 0 && (
                <Card className="mt-6">
                    <CardHeader title="Eligibility checklist" subtitle="What stands between you and reward eligibility" />
                    <CardBody>
                        <ul className="space-y-2">
                            {page.props.eligibility.failed.map((item) => (
                                <li key={item.requirement} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                                    <span className="font-medium text-gray-700">{item.requirement}</span>
                                    <span className="text-gray-500">
                                        required <strong className="text-gray-800">{item.required}</strong> · yours{' '}
                                        <strong className="text-indigo-600">{item.actual}</strong>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            )}

            {page.props.termsNote && (
                <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{page.props.termsNote}</p>
            )}

            <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<ReturnRow>
                    columns={[
                        { header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.reference}</span> },
                        { header: 'Deposit', render: (r) => r.deposit_reference ?? '—' },
                        { header: 'Base', render: (r) => formatMoney(r.base_amount) },
                        { header: 'Rate', render: (r) => (Number(r.rate) ? `${Number(r.rate)}%` : '—') },
                        { header: 'Payout', render: (r) => <strong>{formatMoney(r.payout_amount)}</strong> },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Completed', render: (r) => formatDateTime(r.completed_at) },
                    ]}
                    rows={page.props.returns.data}
                    rowKey={(r) => r.id}
                    emptyMessage="No returns yet. They are created automatically once the club enables the reward module."
                />
                <Pagination currentPage={page.props.returns.current_page} lastPage={page.props.returns.last_page} />
            </div>
        </AppLayout>
    );
}
