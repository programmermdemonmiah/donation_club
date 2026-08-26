import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface ReturnRow {
    id: number;
    reference: string;
    user?: { id: number; name: string; email: string } | null;
    deposit_reference?: string;
    base_amount: string;
    rate: string;
    payout_amount: string;
    status: string;
    created_at: string;
}

export default function AdminReturns() {
    const page = usePage<PageProps & { returns: { data: ReturnRow[]; current_page: number; last_page: number }; filters: { status?: string }; moduleEnabled: boolean }>();

    const setStatus = (status: string) => {
        router.get(route('admin.returns.index'), status ? { status } : {}, { preserveState: true });
    };

    return (
        <AdminLayout>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-gray-900">Returns / Rewards</h1>
                {!page.props.moduleEnabled && (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                        Module disabled — enable in Settings
                    </span>
                )}
            </div>

            <div className="mt-4 w-44">
                <Select value={page.props.filters?.status ?? ''} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    {['pending', 'eligible', 'approved', 'processing', 'completed', 'cancelled', 'reversed'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </Select>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<ReturnRow>
                    columns={[
                        { header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.reference}</span> },
                        {
                            header: 'Member',
                            render: (r) =>
                                r.user ? (
                                    <a href={route('admin.users.show', r.user.id)} className="text-sm text-indigo-600 hover:text-indigo-500">
                                        {r.user.name}
                                    </a>
                                ) : '—',
                        },
                        { header: 'Deposit', render: (r) => r.deposit_reference ?? '—' },
                        { header: 'Base', render: (r) => formatMoney(r.base_amount) },
                        { header: 'Rate', render: (r) => (Number(r.rate) ? `${Number(r.rate)}%` : '—') },
                        { header: 'Payout', render: (r) => <strong>{formatMoney(r.payout_amount)}</strong> },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Created', render: (r) => formatDateTime(r.created_at) },
                        {
                            header: 'Actions',
                            render: (r) => (
                                <div className="flex gap-1.5">
                                    {(r.status === 'pending' || r.status === 'eligible') && (
                                        <>
                                            <ActionBtn route="admin.returns.approve" id={r.id} label="Approve" />
                                            <ActionBtn route="admin.returns.cancel" id={r.id} label="Cancel" danger prompt="Reason for cancelling?" />
                                        </>
                                    )}
                                    {r.status === 'approved' && <ActionBtn route="admin.returns.process" id={r.id} label="Process" />}
                                    {(r.status === 'processing' || r.status === 'approved') && (
                                        <ActionBtn route="admin.returns.complete" id={r.id} label="Complete & pay" confirm={`Credit ${formatMoney(r.payout_amount)} to member wallet and run upline commissions?`} />
                                    )}
                                    {r.status === 'completed' && <ActionBtn route="admin.returns.reverse" id={r.id} label="Reverse" danger prompt="Reason for reversal?" />}
                                </div>
                            ),
                        },
                    ]}
                    rows={page.props.returns.data}
                    rowKey={(r) => r.id}
                    emptyMessage="No returns found."
                />
                <Pagination currentPage={page.props.returns.current_page} lastPage={page.props.returns.last_page} />
            </div>
        </AdminLayout>
    );
}

function ActionBtn({ route: routeName, id, label, danger, confirm, prompt }: {
    route: string;
    id: number;
    label: string;
    danger?: boolean;
    confirm?: string;
    prompt?: string;
}) {
    const onClick = () => {
        let extra = {};

        if (prompt) {
            const reason = window.prompt(prompt);
            if (!reason || reason.length < 5) {
                alert('A reason of at least 5 characters is required.');
                return;
            }
            extra = { reason };
        }

        if (confirm && !window.confirm(confirm)) return;

        router.post(route(routeName, id), extra, { preserveScroll: true });
    };

    return (
        <button
            onClick={onClick}
            className={
                danger
                    ? 'rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100'
                    : 'rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100'
            }
        >
            {label}
        </button>
    );
}
