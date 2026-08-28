import AppLayout from '@/layouts/AppLayout';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { type FormEvent } from 'react';

export default function TwoFactorSetup() {
    const page = usePage<PageProps & { secret: string; qrCodeUrl: string; enabled: boolean }>();
    const { secret, qrCodeUrl, enabled } = page.props;

    const enableForm = useForm({ otp: '' });
    const disableForm = useForm({ otp: '' });

    const handleEnable = (e: FormEvent) => { e.preventDefault(); enableForm.post(route('security.2fa.enable'), { onSuccess: () => enableForm.reset() }); };
    const handleDisable = (e: FormEvent) => { e.preventDefault(); disableForm.post(route('security.2fa.disable'), { onSuccess: () => disableForm.reset() }); };

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Security</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">
                    {enabled ? 'Manage 2FA' : 'Set Up Two-Factor Authentication'}
                </h1>
            </div>

            {!enabled && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* QR Code */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                            <h2 className="text-sm font-black text-gray-900">Step 1: Scan QR Code</h2>
                            <p className="mt-0.5 text-xs text-gray-400">Open Google Authenticator and scan this QR code</p>
                        </div>
                        <div className="flex flex-col items-center p-8 gap-6">
                            <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-6">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                                    alt="2FA QR Code"
                                    className="h-48 w-48 rounded-lg"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-400">Or enter this secret manually:</p>
                                <code className="mt-2 inline-block rounded-xl bg-gray-900 px-5 py-2.5 font-mono text-sm font-bold tracking-[0.25em] text-amber-400 shadow-inner">
                                    {secret}
                                </code>
                            </div>
                        </div>
                    </div>

                    {/* Verify */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                            <h2 className="text-sm font-black text-gray-900">Step 2: Verify Code</h2>
                            <p className="mt-0.5 text-xs text-gray-400">Enter the 6-digit code from your authenticator app</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEnable} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">OTP Code</label>
                                    <input
                                        value={enableForm.data.otp}
                                        onChange={(e) => enableForm.setData('otp', e.target.value)}
                                        placeholder="000000" maxLength={6} required
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] text-gray-900 transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                                    />
                                    {enableForm.errors.otp && <p className="text-xs font-semibold text-red-600">{enableForm.errors.otp}</p>}
                                </div>
                                <button type="submit" disabled={enableForm.processing}
                                    className="group relative w-full overflow-hidden rounded-xl bg-amber-500 py-3 text-sm font-black text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:bg-amber-400 disabled:opacity-60">
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    {enableForm.processing ? 'Enabling…' : 'Enable 2FA'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {enabled && (
                <div className="max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                        <h2 className="text-sm font-black text-gray-900">Disable Two-Factor Authentication</h2>
                        <p className="mt-0.5 text-xs text-gray-400">Enter an OTP code from your authenticator to disable 2FA</p>
                    </div>
                    <div className="p-6">
                        <div className="mb-5 rounded-xl border border-amber-200/50 bg-amber-50 p-4">
                            <p className="text-sm font-semibold text-amber-900">
                                ⚠️ Disabling 2FA will make your account less secure. Only do this if you've lost access to your authenticator app.
                            </p>
                        </div>
                        <form onSubmit={handleDisable} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">OTP Code</label>
                                <input
                                    value={disableForm.data.otp}
                                    onChange={(e) => disableForm.setData('otp', e.target.value)}
                                    placeholder="000000" maxLength={6} required
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] text-gray-900 transition-all focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/20"
                                />
                                {disableForm.errors.otp && <p className="text-xs font-semibold text-red-600">{disableForm.errors.otp}</p>}
                            </div>
                            <button type="submit" disabled={disableForm.processing}
                                className="w-full rounded-xl bg-rose-600 py-3 text-sm font-black text-white transition-all hover:bg-rose-500 disabled:opacity-60">
                                {disableForm.processing ? 'Disabling…' : 'Disable 2FA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
