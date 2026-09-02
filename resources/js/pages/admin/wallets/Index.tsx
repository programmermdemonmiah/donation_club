import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatMoney } from '@/utils/format';

interface WalletRow {
    id: number;
    user?: { id: number; name: string; email: string } | null;
    balance: string;
    locked_balance: string;
    available: string;
}

export default function AdminWallets() {
    const page = usePage<PageProps & { wallets: { data: WalletRow[]; current_page: number; last_page: number } }>();

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Member Wallets</h1>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<WalletRow>
                    columns={[
                        {
                            header: 'Member',
                            render: (w) =>
                                w.user ? (
                                    <a href={route('admin.users.show', w.user.id)} className="group">
                                        <span className="block font-medium text-gray-900 group-hover:text-blue-600">{w.user.name}</span>
                                        <span className="block text-xs text-gray-400">{w.user.email}</span>
                                    </a>
                                ) : '—',
                        },
                        { header: 'Balance', render: (w) => formatMoney(w.balance) },
                        { header: 'Locked', render: (w) => formatMoney(w.locked_balance) },
                        { header: 'Available', render: (w) => <strong>{formatMoney(w.available)}</strong> },
                    ]}
                    rows={page.props.wallets.data}
                    rowKey={(w) => w.id}
                    emptyMessage="No wallets yet."
                />
                <Pagination currentPage={page.props.wallets.current_page} lastPage={page.props.wallets.last_page} />
            </div>
        </AdminLayout>
    );
}
