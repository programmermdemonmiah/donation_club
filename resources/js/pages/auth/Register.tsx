import AuthLayout from '@/layouts/AuthLayout';
import { Link, useForm } from '@inertiajs/react';

export default function Register() {
    const referralCodeFromUrl = (document.location.search.match(/[?&]ref=([A-Za-z0-9]+)/)?.[1] ?? '') as string;

    const form = useForm({
        name: '',
        username: '',
        email: '',
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
                    { label: 'Referral code', key: 'referral_code', type: 'text', placeholder: 'ABC12345', upper: true },
                    { label: 'Password', key: 'password', type: 'password', placeholder: 'Enter your password' },
                    { label: 'Confirm password', key: 'password_confirmation', type: 'password', placeholder: 'Confirm your password' },
                ].map(({ label, key, type, placeholder, autoFocus, upper }) => (
                    <div key={key} className="space-y-1">
                        <label className="block text-sm font-bold text-gray-700">{label}</label>
                        <input
                            type={type}
                            value={(form.data as any)[key]}
                            onChange={(e) => form.setData(key as any, upper ? e.target.value.toUpperCase() : e.target.value)}
                            required
                            autoFocus={autoFocus}
                            placeholder={placeholder}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                        />
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
