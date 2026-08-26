import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link, useForm } from '@inertiajs/react';

export default function Register() {
    const referralCodeFromUrl = (document.location.search.match(/[?&]ref=([A-Za-z0-9]+)/)?.[1] ?? '') as string;

    const form = useForm({
        name: '',
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
                <Input
                    label="Full name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    error={form.errors.name}
                    required
                    autoFocus
                />
                <Input
                    label="Email address"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                />
                <Input
                    label="Referral code (optional)"
                    placeholder="ABC12345"
                    value={form.data.referral_code}
                    onChange={(e) => form.setData('referral_code', e.target.value.toUpperCase())}
                    error={form.errors.referral_code}
                />
                <Input
                    label="Password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                    required
                />
                <Input
                    label="Confirm password"
                    type="password"
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                    error={form.errors.password_confirmation}
                    required
                />
                <Button type="submit" loading={form.processing} className="w-full">
                    Create account
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
                Already a member?{' '}
                <Link href={route('login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Log in
                </Link>
            </p>
        </AuthLayout>
    );
}
