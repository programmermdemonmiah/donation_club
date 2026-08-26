import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
        <AuthLayout title="Forgot password" subtitle="We'll email you a reset link">
            {status && (
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{status}</div>
            )}
            <form onSubmit={submit} className="space-y-4">
                <Input
                    label="Email address"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                    autoFocus
                />
                <Button type="submit" loading={form.processing} className="w-full">
                    Send reset link
                </Button>
            </form>
            <p className="mt-6 text-center text-sm">
                <Link href={route('login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Back to login
                </Link>
            </p>
        </AuthLayout>
    );
}
