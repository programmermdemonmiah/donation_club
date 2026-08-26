import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Link, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate } from '@/utils/format';

interface KycDoc {
    id: number;
    user: { id: number; name: string; email: string } | null;
    document_type: string;
    document_number: string;
    status: string;
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
}

interface Paginated {
    data: KycDoc[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function KycIndex() {
    const page = usePage<PageProps & { documents: Paginated; filters: { search?: string; status?: string } }>();
    const { documents, filters } = page.props;

    const statusColor = (s: string) => {
        switch (s) {
            case 'approved': return 'emerald';
            case 'pending': return 'amber';
            case 'rejected': return 'rose';
            default: return 'gray';
        }
    };

    const search = (key: string, value: string) => {
        router.get(route('admin.kyc.index'), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">KYC Documents</h1>

            <div className="mt-4 flex flex-wrap gap-3">
                <Input
                    placeholder="Search by name or email..."
                    value={filters.search ?? ''}
                    onChange={(e) => search('search', e.target.value)}
                    className="w-64"
                />
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => search('status', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <Card className="mt-4">
                <CardBody>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <th className="px-3 py-2">User</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2">Document No.</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Submitted</th>
                                    <th className="px-3 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.data.map((doc) => (
                                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-3 py-3">
                                            <div className="font-medium text-gray-900">{doc.user?.name}</div>
                                            <div className="text-xs text-gray-500">{doc.user?.email}</div>
                                        </td>
                                        <td className="px-3 py-3 capitalize">{doc.document_type.replace('_', ' ')}</td>
                                        <td className="px-3 py-3 font-mono text-xs">{doc.document_number}</td>
                                        <td className="px-3 py-3">
                                            <Badge color={statusColor(doc.status)}>{doc.status}</Badge>
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">{formatDate(doc.created_at)}</td>
                                        <td className="px-3 py-3">
                                            <Link
                                                href={route('admin.kyc.show', doc.id)}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                            >
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {documents.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-8 text-center text-gray-500">No KYC documents found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {documents.last_page > 1 && (
                        <div className="mt-4 flex justify-center gap-1">
                            {documents.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveState
                                />
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </AdminLayout>
    );
}
