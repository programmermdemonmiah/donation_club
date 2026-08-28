import AppLayout from '@/layouts/AppLayout';
import Badge from '@/components/ui/Badge';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate } from '@/utils/format';
import { type FormEvent, useRef } from 'react';

interface KycDoc {
    id: number; document_type: string; document_number: string;
    status: string; rejection_reason: string | null; reviewed_at: string | null; created_at: string;
}

const docTypes = [
    { value: 'national_id', label: 'National ID Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
];

export default function Kyc() {
    const page = usePage<PageProps & { kycStatus: string; documents: KycDoc[] }>();
    const { kycStatus, documents } = page.props;
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm<{ document_type: string; document_number: string; document_file: File | null }>({
        document_type: 'national_id', document_number: '', document_file: null,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(route('kyc.store'), {
            forceFormData: true,
            onSuccess: () => { form.reset(); if (fileRef.current) fileRef.current.value = ''; },
        });
    };

    const statusColor = (s: string) => s === 'verified' || s === 'approved' ? 'emerald' : s === 'pending' ? 'amber' : s === 'rejected' ? 'rose' : 'gray';

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Identity</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">KYC Verification</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">Verify your identity to unlock withdrawals and higher contribution limits.</p>
            </div>

            {/* Status banner */}
            <div className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${kycStatus === 'verified' ? 'border-emerald-200/50 bg-emerald-50' : kycStatus === 'pending' ? 'border-amber-200/50 bg-amber-50' : 'border-gray-100 bg-white'} shadow-sm`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kycStatus === 'verified' ? 'bg-emerald-100' : kycStatus === 'pending' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    <svg className={`h-6 w-6 ${kycStatus === 'verified' ? 'text-emerald-600' : kycStatus === 'pending' ? 'text-amber-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">Current Status</p>
                    <div className="mt-1">
                        <Badge color={statusColor(kycStatus)}>{kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}</Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {kycStatus !== 'verified' && (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                            <h2 className="text-sm font-black text-gray-900">Submit KYC Document</h2>
                            <p className="mt-0.5 text-xs text-gray-400">Upload a clear photo or scan of your ID</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Document Type</label>
                                    <select value={form.data.document_type} onChange={(e) => form.setData('document_type', e.target.value)}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20">
                                        {docTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Document Number</label>
                                    <input value={form.data.document_number} onChange={(e) => form.setData('document_number', e.target.value)} required
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20" />
                                    {form.errors.document_number && <p className="text-xs font-semibold text-red-600">{form.errors.document_number}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">Upload Document</label>
                                    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => form.setData('document_file', e.target.files?.[0] ?? null)}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-black file:text-amber-700 hover:file:bg-amber-100" />
                                    <p className="text-xs font-medium text-gray-400">Accepted: JPG, PNG, PDF. Max 5MB.</p>
                                    {form.errors.document_file && <p className="text-xs font-semibold text-red-600">{form.errors.document_file}</p>}
                                </div>
                                <button type="submit" disabled={form.processing}
                                    className="group relative w-full overflow-hidden rounded-xl bg-amber-500 py-3 text-sm font-black text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:bg-amber-400 disabled:opacity-60">
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    {form.processing ? 'Submitting…' : 'Submit for Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {documents.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-50 px-6 py-4">
                            <h2 className="text-sm font-black text-gray-900">Submission History</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {documents.map((doc) => (
                                <div key={doc.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black text-gray-900 capitalize">{doc.document_type.replace('_', ' ')}</p>
                                            <p className="font-mono text-xs text-gray-400">{doc.document_number}</p>
                                        </div>
                                        <Badge color={statusColor(doc.status)}>{doc.status}</Badge>
                                    </div>
                                    {doc.rejection_reason && (
                                        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                                            Rejection reason: {doc.rejection_reason}
                                        </p>
                                    )}
                                    <p className="mt-1.5 text-xs text-gray-400">Submitted {formatDate(doc.created_at)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
