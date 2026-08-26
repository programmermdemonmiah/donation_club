import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const form = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('password.update'));
    };

    return (
        <AuthLayout title="Reset password" subtitle="Choose a new password for your account">
            <form onSubmit={submit} className="space-y-4">
                <Input
                    label="Email address"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                />
                <Input
                    label="New password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                    required
                />
                <Input
                    label="Confirm new password"
                    type="password"
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                    error={form.errors.password_confirmation}
                    required
                />
                <Button type="submit" loading={form.processing} className="w-full">
                    Reset password
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
