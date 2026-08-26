import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney } from '@/utils/format';

interface FundRow {
    id: number;
    reference: string;
    user?: { id: number; name: string; email: string } | null;
    fund?: { id: number; name: string } | null;
    requested_amount: string;
    approved_amount?: string | null;
    purpose: string;
    status: string;
    created_at: string;
}

export default function AdminFunds() {
    const page = usePage<PageProps & { requests: { data: FundRow[]; current_page: number; last_page: number }; filters: { status?: string } }>();

    const setStatus = (status: string) => {
        router.get(route('admin.funds.index'), status ? { status } : {}, { preserveState: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Fund Requests</h1>

            <div className="mt-4 w-44">
                <Select value={page.props.filters?.status ?? ''} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    {['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </Select>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<FundRow>
                    columns={[
                        {
                            header: 'Request',
                            render: (r) => (
                                <a href={route('admin.funds.show', r.id)} className="group">
                                    <span className="block font-medium text-gray-900 group-hover:text-indigo-600">{formatMoney(r.requested_amount)}</span>
                                    <span className="font-mono text-xs text-gray-400">{r.reference}</span>
                                </a>
                            ),
                        },
                        {
                            header: 'Member',
                            render: (r) =>
                                r.user ? (
                                    <a href={route('admin.users.show', r.user.id)} className="text-indigo-600 hover:text-indigo-500">{r.user.name}</a>
                                ) : '—',
                        },
                        { header: 'Fund', render: (r) => r.fund?.name ?? '—' },
                        { header: 'Purpose', render: (r) => <span className="block max-w-[220px] truncate text-xs" title={r.purpose}>{r.purpose}</span> },
                        { header: 'Approved', render: (r) => (r.approved_amount ? formatMoney(r.approved_amount) : '—') },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Date', render: (r) => formatDateTime(r.created_at) },
                    ]}
                    rows={page.props.requests.data}
                    rowKey={(r) => r.id}
                    emptyMessage="No fund requests found."
                />
                <Pagination currentPage={page.props.requests.current_page} lastPage={page.props.requests.last_page} />
            </div>
        </AdminLayout>
    );
}
