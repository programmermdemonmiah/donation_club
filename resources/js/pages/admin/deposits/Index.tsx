import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Input, Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime, formatMoney, formatSequence } from '@/utils/format';

interface DepositRow {
    id: number;
    reference: string;
    amount: string;
    status: string;
    sequence_number: number | null;
    user?: { id: number; name: string; email: string } | null;
    created_at: string;
}

export default function AdminDeposits() {
    const page = usePage<PageProps & { deposits: { data: DepositRow[]; current_page: number; last_page: number }; filters: { search?: string; status?: string } }>();
    const [search, setSearch] = useState(page.props.filters?.search ?? '');

    const applyFilter = (status: string) => {
        router.get(route('admin.deposits.index'), { search, status: status || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Deposits</h1>

            <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="w-72">
                    <Input
                        placeholder="Search reference / member…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter('')}
                    />
                </div>
                <div className="w-44">
                    <Select value={page.props.filters?.status ?? ''} onChange={(e) => applyFilter(e.target.value)}>
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                    </Select>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<DepositRow>
                    columns={[
                        {
                            header: 'Deposit',
                            render: (d) => (
                                <a href={route('admin.deposits.show', d.id)} className="group">
                                    <span className="block font-medium text-gray-900 group-hover:text-blue-600">{formatSequence(d.sequence_number)}</span>
                                    <span className="font-mono text-xs text-gray-400">{d.reference}</span>
                                </a>
                            ),
                        },
                        {
                            header: 'Member',
                            render: (d) =>
                                d.user ? (
                                    <a href={route('admin.users.show', d.user.id)} className="text-sm text-blue-600 hover:text-blue-500">
                                        {d.user.name}
                                    </a>
                                ) : '—',
                        },
                        { header: 'Amount', render: (d) => formatMoney(d.amount) },
                        { header: 'Status', render: (d) => <Badge value={d.status} /> },
                        { header: 'Created', render: (d) => formatDateTime(d.created_at) },
                    ]}
                    rows={page.props.deposits.data}
                    rowKey={(d) => d.id}
                />
                <Pagination currentPage={page.props.deposits.current_page} lastPage={page.props.deposits.last_page} />
            </div>
        </AdminLayout>
    );
}
