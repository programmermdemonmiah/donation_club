import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function TwoFactor() {
    const page = usePage<PageProps & { enabled: boolean }>();
    const { enabled } = page.props;

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h1>
            <p className="mt-1 text-sm text-gray-500">
                Add an extra layer of security to your account using Google Authenticator.
            </p>

            <Card className="mt-6">
                <CardHeader
                    title="2FA Status"
                    subtitle={enabled ? 'Your account is protected with 2FA' : '2FA is not enabled on your account'}
                />
                <CardBody>
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${enabled ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                            {enabled ? (
                                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className={`font-semibold ${enabled ? 'text-emerald-700' : 'text-gray-700'}`}>
                                {enabled ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {enabled
                                    ? 'Your account has two-factor authentication enabled.'
                                    : 'Enable 2FA to protect your account from unauthorized access.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link href={route('security.2fa.setup')}>
                            <Button>{enabled ? 'Manage 2FA' : 'Enable 2FA'}</Button>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </AppLayout>
    );
}
