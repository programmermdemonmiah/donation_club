import AuthLayout from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Login() {
    const page = usePage<PageProps>();
    const status = page.props.flash?.status;
    const form = useForm({ email: '', password: '', remember: false });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('login'));
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Log in to your member account">
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
                        required
                        autoFocus
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                        placeholder="you@example.com"
                    />
                    {form.errors.email && <p className="text-xs font-semibold text-red-600">{form.errors.email}</p>}
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700">Password</label>
                    <input
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        required
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                        placeholder="••••••••"
                    />
                    {form.errors.password && <p className="text-xs font-semibold text-red-600">{form.errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                        />
                        Remember me
                    </label>
                    <Link href={route('password.request')} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3.5 text-sm font-black tracking-wider text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] disabled:opacity-60"
                >
                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full"></span>
                    {form.processing ? 'Logging in…' : 'Log In'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-gray-500">
                New to the club?{' '}
                <Link href={route('register')} className="font-black text-blue-600 hover:text-blue-700 transition-colors">
                    Create an account →
                </Link>
            </p>
        </AuthLayout>
    );
}
