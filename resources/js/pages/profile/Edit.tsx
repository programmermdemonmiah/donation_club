import AppLayout from '@/layouts/AppLayout';
import { Input, Textarea } from '@/components/ui/Input';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
            <div className="border-b border-gray-50 bg-gray-50/60 px-6 py-4">
                <h2 className="text-sm font-black text-gray-900">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs font-medium text-gray-400">{subtitle}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function FormInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700">{label}</label>
            <input {...props} className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50" />
        </div>
    );
}

export default function Profile() {
    const page = usePage<PageProps & { auth: { user: { name: string; email: string; referral_code?: string } }; profile: Record<string, unknown> }>();
    const user = page.props.auth.user;

    const profile = useForm({
        name: user.name,
        phone: (page.props.profile?.phone as string) ?? '',
        address: (page.props.profile?.address as string) ?? '',
        city: (page.props.profile?.city as string) ?? '',
        country: (page.props.profile?.country as string) ?? '',
        date_of_birth: (page.props.profile?.date_of_birth as string) ?? '',
        bio: (page.props.profile?.bio as string) ?? '',
    });

    const password = useForm({ current_password: '', password: '', password_confirmation: '' });

    return (
        <AppLayout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Account Settings</p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-gray-900">Profile & Security</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Section title="Profile Information" subtitle={`Referral code: ${user.referral_code ?? '—'}`}>
                    <form onSubmit={(e) => { e.preventDefault(); profile.put(route('profile.update')); }} className="space-y-4">
                        <FormInput label="Full Name" value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} required />
                        <FormInput label="Email (read-only)" value={user.email} disabled />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormInput label="Phone" value={profile.data.phone} onChange={(e) => profile.setData('phone', e.target.value)} />
                            <FormInput label="City" value={profile.data.city} onChange={(e) => profile.setData('city', e.target.value)} />
                            <FormInput label="Country" value={profile.data.country} onChange={(e) => profile.setData('country', e.target.value)} />
                            <FormInput label="Date of Birth" type="date" value={profile.data.date_of_birth} onChange={(e) => profile.setData('date_of_birth', e.target.value)} />
                        </div>
                        <FormInput label="Address" value={profile.data.address} onChange={(e) => profile.setData('address', e.target.value)} />
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-gray-700">Bio</label>
                            <textarea
                                rows={3} value={profile.data.bio}
                                onChange={(e) => profile.setData('bio', e.target.value)}
                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                            />
                        </div>
                        <button type="submit" disabled={profile.processing}
                            className="group relative overflow-hidden rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-black text-gray-900 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all hover:bg-amber-400 disabled:opacity-60">
                            <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                            {profile.processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </form>
                </Section>

                <div className="space-y-6">
                    <Section title="Change Password">
                        <form onSubmit={(e) => { e.preventDefault(); password.put(route('password.change'), { onSuccess: () => password.reset() }); }} className="space-y-4">
                            {[
                                { label: 'Current Password', key: 'current_password' },
                                { label: 'New Password', key: 'password' },
                                { label: 'Confirm New Password', key: 'password_confirmation' },
                            ].map(({ label, key }) => (
                                <div key={key} className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700">{label}</label>
                                    <input type="password" value={(password.data as any)[key]} onChange={(e) => password.setData(key as any, e.target.value)} required
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20" />
                                    {(password.errors as any)[key] && <p className="text-xs font-semibold text-red-600">{(password.errors as any)[key]}</p>}
                                </div>
                            ))}
                            <button type="submit" disabled={password.processing}
                                className="group relative overflow-hidden rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-black text-white transition-all hover:bg-gray-800 disabled:opacity-60">
                                {password.processing ? 'Updating…' : 'Update Password'}
                            </button>
                        </form>
                    </Section>

                    <Section title="Sessions" subtitle="Database-backed secure sessions with CSRF protection">
                        <p className="text-sm font-medium text-gray-500">
                            Logging out invalidates your session everywhere on this device. For security questions contact club support.
                        </p>
                    </Section>
                </div>
            </div>
        </AppLayout>
    );
}
