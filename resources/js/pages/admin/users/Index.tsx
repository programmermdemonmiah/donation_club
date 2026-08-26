import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Input, Select } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface UserRow {
    id: number;
    name: string;
    email: string;
    status: string;
    is_admin: boolean;
    email_verified: boolean;
    referral_code: string;
    direct_referrals: number;
    joined_at: string;
}

export default function AdminUsers() {
    const page = usePage<PageProps & { users: { data: UserRow[]; current_page: number; last_page: number }; filters: { search?: string; status?: string } }>();
    const [search, setSearch] = useState(page.props.filters?.search ?? '');

    const applyFilter = (status: string) => {
        router.get(route('admin.users.index'), { search, status: status || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Users</h1>

            <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="w-64">
                    <Input
                        placeholder="Search name / email / code…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter('')}
                    />
                </div>
                <div className="w-40">
                    <Select value={page.props.filters?.status ?? ''} onChange={(e) => applyFilter(e.target.value)}>
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </Select>
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<UserRow>
                    columns={[
                        {
                            header: 'Member',
                            render: (u) => (
                                <a href={route('admin.users.show', u.id)} className="group">
                                    <span className="block font-medium text-gray-900 group-hover:text-indigo-600">{u.name}</span>
                                    <span className="block text-xs text-gray-400">{u.email}</span>
                                </a>
                            ),
                        },
                        { header: 'Referral code', render: (u) => <span className="font-mono text-xs">{u.referral_code}</span> },
                        { header: 'Direct', render: (u) => u.direct_referrals },
                        {
                            header: 'Verified',
                            render: (u) =>
                                u.email_verified ? (
                                    <span className="text-emerald-600">✓</span>
                                ) : (
                                    <span className="text-amber-500">pending</span>
                                ),
                        },
                        { header: 'Role', render: (u) => (u.is_admin ? <Badge value="active" label="Admin" /> : 'Member') },
                        { header: 'Status', render: (u) => <Badge value={u.status} /> },
                        { header: 'Joined', render: (u) => u.joined_at },
                    ]}
                    rows={page.props.users.data}
                    rowKey={(u) => u.id}
                />
                <Pagination currentPage={page.props.users.current_page} lastPage={page.props.users.last_page} />
            </div>
        </AdminLayout>
    );
}
