import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { type FormEvent } from 'react';

export default function TwoFactorSetup() {
    const page = usePage<PageProps & { secret: string; qrCodeUrl: string; enabled: boolean }>();
    const { secret, qrCodeUrl, enabled } = page.props;

    const enableForm = useForm({ otp: '' });
    const disableForm = useForm({ otp: '' });

    const handleEnable = (e: FormEvent) => {
        e.preventDefault();
        enableForm.post(route('security.2fa.enable'), {
            onSuccess: () => enableForm.reset(),
        });
    };

    const handleDisable = (e: FormEvent) => {
        e.preventDefault();
        disableForm.post(route('security.2fa.disable'), {
            onSuccess: () => disableForm.reset(),
        });
    };

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">
                {enabled ? 'Manage Two-Factor Authentication' : 'Set Up Two-Factor Authentication'}
            </h1>

            {!enabled && (
                <Card className="mt-6">
                    <CardHeader title="Step 1: Scan QR Code" subtitle="Open Google Authenticator and scan this QR code" />
                    <CardBody>
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-6">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                                    alt="2FA QR Code"
                                    className="h-48 w-48"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Or enter this secret manually:</p>
                                <code className="mt-1 inline-block rounded-lg bg-gray-100 px-4 py-2 font-mono text-sm font-bold tracking-wider text-indigo-700">
                                    {secret}
                                </code>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {!enabled && (
                <Card className="mt-6">
                    <CardHeader title="Step 2: Verify Code" subtitle="Enter the 6-digit code from your authenticator app" />
                    <CardBody>
                        <form onSubmit={handleEnable} className="space-y-4">
                            <Input
                                label="OTP Code"
                                value={enableForm.data.otp}
                                onChange={(e) => enableForm.setData('otp', e.target.value)}
                                error={enableForm.errors.otp}
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                            <Button type="submit" loading={enableForm.processing}>
                                Enable 2FA
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            )}

            {enabled && (
                <Card className="mt-6">
                    <CardHeader title="Disable Two-Factor Authentication" subtitle="Enter an OTP code from your authenticator to disable 2FA" />
                    <CardBody>
                        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm text-amber-800">
                                ⚠️ Disabling 2FA will make your account less secure. Only do this if you've lost access to your authenticator app.
                            </p>
                        </div>
                        <form onSubmit={handleDisable} className="space-y-4">
                            <Input
                                label="OTP Code"
                                value={disableForm.data.otp}
                                onChange={(e) => disableForm.setData('otp', e.target.value)}
                                error={disableForm.errors.otp}
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                            <Button type="submit" loading={disableForm.processing} className="bg-rose-600 hover:bg-rose-500">
                                Disable 2FA
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            )}
        </AppLayout>
    );
}
