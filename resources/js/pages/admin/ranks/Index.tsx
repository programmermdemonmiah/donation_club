import AdminLayout from '@/layouts/AdminLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface RankRow {
    id: number;
    name: string;
    slug: string;
    level: number;
    color: string;
    active: boolean;
    requirements_count: number;
    holders: number;
}

export default function AdminRanks() {
    const page = usePage<PageProps & { ranks: RankRow[]; requirementKeys: Record<string, string> }>();

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Ranks</h1>
            <p className="mt-1 text-sm text-gray-500">Rank requirements are evaluated automatically by the scheduler and on demand.</p>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <Table<RankRow>
                    columns={[
                        {
                            header: 'Rank',
                            render: (r) => (
                                <span className="flex items-center gap-2 font-medium text-gray-900">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                                    {r.name}
                                </span>
                            ),
                        },
                        { header: 'Level', render: (r) => r.level },
                        { header: 'Requirements', render: (r) => r.requirements_count },
                        { header: 'Members at rank', render: (r) => r.holders },
                        {
                            header: 'State',
                            render: (r) =>
                                r.active ? (
                                    <span className="text-emerald-600 text-sm font-medium">Active</span>
                                ) : (
                                    <span className="text-gray-400 text-sm">Inactive</span>
                                ),
                        },
                        {
                            header: '',
                            render: (r) => (
                                <a href={route('admin.ranks.edit', r.id)}>
                                    <Button size="sm" variant="outline">Edit</Button>
                                </a>
                            ),
                        },
                    ]}
                    rows={page.props.ranks}
                    rowKey={(r) => r.id}
                />
            </div>
        </AdminLayout>
    );
}
