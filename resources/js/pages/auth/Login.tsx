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
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{status}</div>
            )}
            <form onSubmit={submit} className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                    autoFocus
                />
                <Input
                    label="Password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                    required
                />
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Remember me
                    </label>
                    <Link href={route('password.request')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Forgot password?
                    </Link>
                </div>
                <Button type="submit" loading={form.processing} className="w-full">
                    Log in
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
                New to the club?{' '}
                <Link href={route('register')} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Create an account
                </Link>
            </p>
        </AuthLayout>
    );
}
