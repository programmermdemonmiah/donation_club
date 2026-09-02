import AuthLayout from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const page = usePage<PageProps>();
    const status = page.props.flash?.status;
    const form = useForm({ username: '', password: '', remember: false });

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
                    <label className="block text-sm font-bold text-gray-700">Username</label>
                    <input
                        type="text"
                        value={form.data.username}
                        onChange={(e) => form.setData('username', e.target.value)}
                        required
                        autoFocus
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                        placeholder="Enter your username"
                    />
                    {form.errors.username && <p className="text-xs font-semibold text-red-600">{form.errors.username}</p>}
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            required
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 pr-12"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none p-1"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
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
