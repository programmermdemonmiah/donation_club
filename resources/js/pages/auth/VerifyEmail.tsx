import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function VerifyEmail({ status }: { status?: string }) {
    const page = usePage<PageProps>();
    const form = useForm({});

    const resend = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verify your email" subtitle="A verification link was sent to your inbox">
            {(status === 'verification-link-sent' || page.props.flash?.status === 'verification-link-sent') && (
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    A fresh verification link has been sent to your email.
                </div>
            )}
            <div className="space-y-5">
                <p className="text-sm text-gray-600">
                    Before you can start contributing, please verify your email address by clicking the link we sent you.
                </p>
                <form onSubmit={resend}>
                    <Button type="submit" variant="outline" loading={form.processing} className="w-full">
                        Resend verification email
                    </Button>
                </form>
                <p className="text-center text-sm">
                    <button onClick={(e) => { e.preventDefault(); window.location.href = route('logout'); }} className="font-medium text-blue-600 hover:text-blue-500">
                        Log out
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}
