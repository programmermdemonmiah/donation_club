import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface WithdrawalRow {
    id: number;
    reference: string;
    user?: { id: number; name: string; email: string } | null;
    amount: string;
    fee: string;
    net_amount: string;
    method: string;
    status: string;
    created_at: string;
}

export default function AdminWithdrawals() {
    const page = usePage<PageProps & { withdrawals: { data: WithdrawalRow[]; current_page: number; last_page: number }; filters: { status?: string } }>();

    const setStatus = (status: string) => {
        router.get(route('admin.withdrawals.index'), status ? { status } : {}, { preserveState: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Withdrawals</h1>

            <div className="mt-4 w-44">
                <Select value={page.props.filters?.status ?? ''} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    {['pending', 'approved', 'processing', 'completed', 'failed', 'rejected', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </Select>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<WithdrawalRow>
                    columns={[
                        {
                            header: 'Withdrawal',
                            render: (w) => (
                                <a href={route('admin.withdrawals.show', w.id)} className="group">
                                    <span className="block font-medium text-gray-900 group-hover:text-indigo-600">{formatMoney(w.net_amount)}</span>
                                    <span className="font-mono text-xs text-gray-400">{w.reference}</span>
                                </a>
                            ),
                        },
                        {
                            header: 'Member',
                            render: (w) =>
                                w.user ? (
                                    <a href={route('admin.users.show', w.user.id)} className="text-indigo-600 hover:text-indigo-500">{w.user.name}</a>
                                ) : '—',
                        },
                        { header: 'Amount', render: (w) => formatMoney(w.amount) },
                        { header: 'Fee', render: (w) => formatMoney(w.fee) },
                        { header: 'Method', render: (w) => <span className="capitalize">{w.method}</span> },
                        { header: 'Status', render: (w) => <Badge value={w.status} /> },
                        { header: 'Requested', render: (w) => formatDateTime(w.created_at) },
                    ]}
                    rows={page.props.withdrawals.data}
                    rowKey={(w) => w.id}
                    emptyMessage="No withdrawal requests."
                />
                <Pagination currentPage={page.props.withdrawals.current_page} lastPage={page.props.withdrawals.last_page} />
            </div>
        </AdminLayout>
    );
}
