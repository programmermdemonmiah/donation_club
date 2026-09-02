import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';
import { formatDateTime } from '@/utils/format';

interface LogRow {
    id: number;
    actor?: { id: number; name: string; email: string } | null;
    action: string;
    model_type?: string | null;
    model_id?: number | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address?: string | null;
    created_at: string;
}

export default function AdminAuditLogs() {
    const page = usePage<PageProps & { logs: { data: LogRow[]; current_page: number; last_page: number }; filters: { search?: string } }>();
    const [search, setSearch] = useState(page.props.filters?.search ?? '');

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
            <p className="mt-1 text-sm text-gray-500">
                Append-only trail of every administrative and financial action. Records are never deleted.
            </p>

            <div className="mt-4 w-80">
                <Input
                    placeholder="Filter by action / model…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            router.get(route('admin.audit-logs.index'), { search }, { preserveState: true });
                        }
                    }}
                />
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<LogRow>
                    columns={[
                        { header: 'Time', render: (l) => <span className="text-xs text-gray-500">{formatDateTime(l.created_at)}</span> },
                        { header: 'Actor', render: (l) => l.actor?.name ?? <span className="italic text-gray-400">system</span> },
                        { header: 'Action', render: (l) => <span className="font-mono text-xs font-semibold text-blue-600">{l.action}</span> },
                        { header: 'Model', render: (l) => (l.model_type ? `${l.model_type.split('\\').pop()}#${l.model_id}` : '—') },
                        {
                            header: 'Changes',
                            render: (l) => (
                                <details className="max-w-md">
                                    <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">view</summary>
                                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-[10px] leading-relaxed text-gray-600">
{JSON.stringify({ old: l.old_values, new: l.new_values }, null, 2)}
                                    </pre>
                                </details>
                            ),
                        },
                        { header: 'IP', render: (l) => <span className="text-xs">{l.ip_address}</span> },
                    ]}
                    rows={page.props.logs.data}
                    rowKey={(l) => l.id}
                    emptyMessage="No audit entries yet."
                />
                <Pagination currentPage={page.props.logs.current_page} lastPage={page.props.logs.last_page} />
            </div>
        </AdminLayout>
    );
}
