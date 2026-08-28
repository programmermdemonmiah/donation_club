import AuthLayout from '@/layouts/AuthLayout';
import { Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const form = useForm({ token, email: email ?? '', password: '', password_confirmation: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('password.update'));
    };

    return (
        <AuthLayout title="Reset your password" subtitle="Choose a strong new password for your account">
            <form onSubmit={submit} className="space-y-4">
                {[
                    { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@example.com' },
                    { label: 'New password', key: 'password', type: 'password', placeholder: '••••••••' },
                    { label: 'Confirm new password', key: 'password_confirmation', type: 'password', placeholder: '••••••••' },
                ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className="space-y-1">
                        <label className="block text-sm font-bold text-gray-700">{label}</label>
                        <input
                            type={type}
                            value={(form.data as any)[key]}
                            onChange={(e) => form.setData(key as any, e.target.value)}
                            required placeholder={placeholder}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                        />
                        {(form.errors as any)[key] && <p className="text-xs font-semibold text-red-600">{(form.errors as any)[key]}</p>}
                    </div>
                ))}
                <button
                    type="submit" disabled={form.processing}
                    className="group relative w-full overflow-hidden rounded-xl bg-amber-500 py-3.5 text-sm font-black tracking-wider text-gray-900 shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 hover:bg-amber-400 disabled:opacity-60"
                >
                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full"></span>
                    {form.processing ? 'Resetting…' : 'Reset Password'}
                </button>
            </form>
            <p className="mt-8 text-center">
                <Link href={route('login')} className="text-sm font-black text-amber-600 hover:text-amber-700 transition-colors">
                    ← Back to login
                </Link>
            </p>
        </AuthLayout>
    );
}
