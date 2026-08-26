import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate } from '@/utils/format';
import { type FormEvent, useState } from 'react';

interface KycDocDetail {
    id: number;
    user: { id: number; name: string; email: string } | null;
    document_type: string;
    document_number: string;
    file_url: string;
    status: string;
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
}

export default function KycShow() {
    const page = usePage<PageProps & { document: KycDocDetail }>();
    const { document: doc } = page.props;
    const [showReject, setShowReject] = useState(false);

    const approveForm = useForm({});
    const rejectForm = useForm({ rejection_reason: '' });

    const handleApprove = (e: FormEvent) => {
        e.preventDefault();
        approveForm.post(route('admin.kyc.approve', doc.id));
    };

    const handleReject = (e: FormEvent) => {
        e.preventDefault();
        rejectForm.post(route('admin.kyc.reject', doc.id));
    };

    const statusColor = (s: string) => {
        switch (s) {
            case 'approved': return 'emerald';
            case 'pending': return 'amber';
            case 'rejected': return 'rose';
            default: return 'gray';
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">KYC Document Review</h1>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader title="Document Details" />
                    <CardBody>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="font-medium text-gray-500">User</dt>
                                <dd className="text-gray-900">{doc.user?.name} ({doc.user?.email})</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-gray-500">Type</dt>
                                <dd className="capitalize text-gray-900">{doc.document_type.replace('_', ' ')}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-gray-500">Document No.</dt>
                                <dd className="font-mono text-gray-900">{doc.document_number}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-gray-500">Status</dt>
                                <dd><Badge color={statusColor(doc.status)}>{doc.status}</Badge></dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-gray-500">Submitted</dt>
                                <dd className="text-gray-900">{formatDate(doc.created_at)}</dd>
                            </div>
                            {doc.rejection_reason && (
                                <div className="flex justify-between">
                                    <dt className="font-medium text-gray-500">Rejection Reason</dt>
                                    <dd className="text-rose-600">{doc.rejection_reason}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="mt-4">
                            <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                View / Download Document
                            </a>
                        </div>
                    </CardBody>
                </Card>

                {doc.status === 'pending' && (
                    <Card>
                        <CardHeader title="Review Actions" />
                        <CardBody>
                            <div className="space-y-4">
                                <form onSubmit={handleApprove}>
                                    <Button type="submit" loading={approveForm.processing} className="w-full bg-emerald-600 hover:bg-emerald-500">
                                        ✅ Approve KYC
                                    </Button>
                                </form>

                                {!showReject ? (
                                    <button
                                        onClick={() => setShowReject(true)}
                                        className="w-full rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                                    >
                                        ❌ Reject KYC
                                    </button>
                                ) : (
                                    <form onSubmit={handleReject} className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                                        <textarea
                                            value={rejectForm.data.rejection_reason}
                                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                            placeholder="Reason for rejection..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                                            rows={3}
                                            required
                                        />
                                        {rejectForm.errors.rejection_reason && (
                                            <p className="text-sm text-rose-600">{rejectForm.errors.rejection_reason}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <Button type="submit" loading={rejectForm.processing} className="bg-rose-600 hover:bg-rose-500">
                                                Confirm Reject
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => setShowReject(false)}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
