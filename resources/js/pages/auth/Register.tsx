import AuthLayout from '@/layouts/AuthLayout';
import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

interface ReferrerInfo {
    name: string;
    username: string;
}

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

    const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
    const [referrerStatus, setReferrerStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const code = form.data.referral_code.trim();

        if (!code) {
            setReferrer(null);
            setReferrerStatus('idle');
            return;
        }

        setReferrerStatus('loading');

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/referral-lookup?code=${encodeURIComponent(code)}`);
                const data = await res.json();
                if (data) {
                    setReferrer(data);
                    setReferrerStatus('found');
                } else {
                    setReferrer(null);
                    setReferrerStatus('not_found');
                }
            } catch {
                setReferrer(null);
                setReferrerStatus('not_found');
            }
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [form.data.referral_code]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('register'));
    };

    const fields = [
        { label: 'Full name', key: 'name', type: 'text', placeholder: 'John Smith', autoFocus: true },
        { label: 'Username', key: 'username', type: 'text', placeholder: 'Enter your username' },
        { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@example.com' },
        { label: 'Secret code', key: 'secret_code', type: 'text', placeholder: '000000', upper: true },
        { label: 'Referral code', key: 'referral_code', type: 'text', placeholder: 'ABC123', upper: true },
        { label: 'Password', key: 'password', type: 'password', placeholder: 'Enter your password' },
        { label: 'Confirm password', key: 'password_confirmation', type: 'password', placeholder: 'Confirm your password' },
    ];

    return (
        <AuthLayout title="Join the club" subtitle="Create your member account in under a minute">
            <form onSubmit={submit} className="space-y-4">
                {fields.map(({ label, key, type, placeholder, autoFocus, upper }) => (
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

                        {/* Referrer preview below referral_code field */}
                        {key === 'referral_code' && (
                            <div className="min-h-[2rem]">
                                {referrerStatus === 'loading' && (
                                    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                        <svg className="h-4 w-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        <span className="text-xs font-medium text-gray-400">Looking up referral code…</span>
                                    </div>
                                )}
                                {referrerStatus === 'found' && referrer && (
                                    <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-xs font-black text-white shadow-sm">
                                            {referrer.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-emerald-800">{referrer.name}</p>
                                            <p className="text-xs font-medium text-emerald-600">@{referrer.username}</p>
                                        </div>
                                        <span className="ml-auto flex items-center gap-1 text-xs font-bold text-emerald-600">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Valid
                                        </span>
                                    </div>
                                )}
                                {referrerStatus === 'not_found' && (
                                    <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                                        <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-xs font-medium text-red-600">Referral code not found.</span>
                                    </div>
                                )}
                            </div>
                        )}

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
