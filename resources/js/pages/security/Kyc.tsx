import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate } from '@/utils/format';
import { type FormEvent, useRef } from 'react';

interface KycDoc {
    id: number;
    document_type: string;
    document_number: string;
    status: string;
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
}

export default function Kyc() {
    const page = usePage<PageProps & { kycStatus: string; documents: KycDoc[] }>();
    const { kycStatus, documents } = page.props;
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm<{
        document_type: string;
        document_number: string;
        document_file: File | null;
    }>({
        document_type: 'national_id',
        document_number: '',
        document_file: null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('kyc.store'), {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'verified':
            case 'approved':
                return 'emerald';
            case 'pending':
                return 'amber';
            case 'rejected':
                return 'rose';
            default:
                return 'gray';
        }
    };

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
            <p className="mt-1 text-sm text-gray-500">
                Verify your identity to unlock withdrawals and higher contribution limits.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <span className="text-sm font-medium text-gray-700">Current Status:</span>
                <Badge color={statusColor(kycStatus)}>{kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}</Badge>
            </div>

            {kycStatus !== 'verified' && (
                <Card className="mt-6">
                    <CardHeader title="Submit KYC Document" subtitle="Upload a clear photo or scan of your ID document" />
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                <select
                                    value={form.data.document_type}
                                    onChange={(e) => form.setData('document_type', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="national_id">National ID Card</option>
                                    <option value="passport">Passport</option>
                                    <option value="driving_license">Driving License</option>
                                </select>
                            </div>
                            <Input
                                label="Document Number"
                                value={form.data.document_number}
                                onChange={(e) => form.setData('document_number', e.target.value)}
                                error={form.errors.document_number}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => form.setData('document_file', e.target.files?.[0] ?? null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {form.errors.document_file && (
                                    <p className="mt-1 text-sm text-rose-600">{form.errors.document_file}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-400">Accepted: JPG, PNG, PDF. Max 5MB.</p>
                            </div>
                            <Button type="submit" loading={form.processing}>
                                Submit for Review
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            )}

            {documents.length > 0 && (
                <Card className="mt-6">
                    <CardHeader title="Submission History" />
                    <CardBody>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <th className="px-3 py-2">Type</th>
                                        <th className="px-3 py-2">Document No.</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Submitted</th>
                                        <th className="px-3 py-2">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc.id} className="border-b border-gray-100">
                                            <td className="px-3 py-3 capitalize">{doc.document_type.replace('_', ' ')}</td>
                                            <td className="px-3 py-3 font-mono text-xs">{doc.document_number}</td>
                                            <td className="px-3 py-3">
                                                <Badge color={statusColor(doc.status)}>{doc.status}</Badge>
                                            </td>
                                            <td className="px-3 py-3 text-gray-500">{formatDate(doc.created_at)}</td>
                                            <td className="px-3 py-3 text-gray-500">{doc.rejection_reason ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            )}
        </AppLayout>
    );
}
