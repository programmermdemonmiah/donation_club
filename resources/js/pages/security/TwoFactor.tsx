import AppLayout from '@/layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function TwoFactor() {
    const page = usePage<PageProps & { enabled: boolean }>();
    const { enabled } = page.props;

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Security</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Two-Factor Authentication</h1>
                <p className="mt-1 text-sm font-medium text-gray-500">Add an extra layer of security using Google Authenticator.</p>
            </div>

            <div className="max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                    <h2 className="text-sm font-black text-gray-900">2FA Status</h2>
                    <p className="mt-0.5 text-xs text-gray-400">{enabled ? 'Your account is protected with 2FA' : '2FA is not enabled on your account'}</p>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-5">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${enabled ? 'bg-emerald-50 ring-1 ring-emerald-100' : 'bg-gray-50 ring-1 ring-gray-100'}`}>
                            {enabled ? (
                                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            ) : (
                                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className={`text-base font-black ${enabled ? 'text-emerald-700' : 'text-gray-700'}`}>{enabled ? 'Enabled & Active' : 'Not Enabled'}</p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                                {enabled ? 'Your account is secured with two-factor authentication.' : 'Enable 2FA to protect your account from unauthorized access.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link href={route('security.2fa.setup')}
                            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all duration-300 ${enabled ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50' : 'bg-amber-500 text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:bg-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]'}`}>
                            {enabled ? 'Manage 2FA' : 'Enable 2FA →'}
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
