import AuthLayout from '@/layouts/AuthLayout';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const referralCodeFromUrl = (document.location.search.match(/[?&]ref=([A-Za-z0-9]+)/)?.[1] ?? '') as string;

    const form = useForm({
        name: '',
        username: '',
        email: '',
        secret_code: '',
        password: '',
        password_confirmation: '',
        referral_code: referralCodeFromUrl,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('register'));
    };

    return (
        <AuthLayout title="Join the club" subtitle="Create your member account in under a minute">
            <form onSubmit={submit} className="space-y-4">
                {[
                    { label: 'Full name', key: 'name', type: 'text', placeholder: 'John Smith', autoFocus: true },
                    { label: 'Username', key: 'username', type: 'text', placeholder: 'Enter your username' },
                    { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@example.com' },
                    { label: 'Secret code', key: 'secret_code', type: 'text', placeholder: '000000', upper: true },
                    { label: 'Referral code', key: 'referral_code', type: 'text', placeholder: 'ABC123', upper: true },
                    { label: 'Password', key: 'password', type: 'password', placeholder: 'Enter your password' },
                    { label: 'Confirm password', key: 'password_confirmation', type: 'password', placeholder: 'Confirm your password' },
                ].map(({ label, key, type, placeholder, autoFocus, upper }) => (
                    <div key={key} className="space-y-1">
                        <label className="block text-sm font-bold text-gray-700">{label}</label>
                        <div className="relative">
                            <input
                                type={type === 'password' ? ((key === 'password' ? showPassword : showConfirmPassword) ? 'text' : 'password') : type}
                                value={(form.data as any)[key]}
                                onChange={(e) => form.setData(key as any, upper ? e.target.value.toUpperCase() : e.target.value)}
                                required
                                autoFocus={autoFocus}
                                placeholder={placeholder}
                                className={`block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 ${type === 'password' ? 'pr-12' : ''}`}
                            />
                            {type === 'password' && (
                                <button
                                    type="button"
                                    onClick={() => key === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none p-1"
                                >
                                    {(key === 'password' ? showPassword : showConfirmPassword) ? (
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
                            )}
                        </div>
                        {(form.errors as any)[key] && (
                            <p className="text-xs font-semibold text-red-600">{(form.errors as any)[key]}</p>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={form.processing}
                    className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3.5 text-sm font-black tracking-wider text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] disabled:opacity-60"
                >
                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full"></span>
                    {form.processing ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-gray-500">
                Already a member?{' '}
                <Link href={route('login')} className="font-black text-blue-600 hover:text-blue-700 transition-colors">
                    Log in →
                </Link>
            </p>
        </AuthLayout>
    );
}
