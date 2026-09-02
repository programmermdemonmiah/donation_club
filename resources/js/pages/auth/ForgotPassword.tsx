import AuthLayout from '@/layouts/AuthLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function ForgotPassword() {
    const page = usePage<PageProps>();
    const status = page.props.flash?.status;
    const form = useForm({ email: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot password?" subtitle="We'll email you a secure reset link">
            {status && (
                <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    {status}
                </div>
            )}
            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700">Email address</label>
                    <input
                        type="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        required autoFocus
                        placeholder="you@example.com"
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                    />
                    {form.errors.email && <p className="text-xs font-semibold text-red-600">{form.errors.email}</p>}
                </div>
                <button
                    type="submit" disabled={form.processing}
                    className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3.5 text-sm font-black tracking-wider text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 hover:bg-blue-500 disabled:opacity-60"
                >
                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full"></span>
                    {form.processing ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>
            <p className="mt-8 text-center">
                <Link href={route('login')} className="text-sm font-black text-blue-600 hover:text-blue-700 transition-colors">
                    ← Back to login
                </Link>
            </p>
        </AuthLayout>
    );
}
