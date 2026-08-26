import { Link, usePage } from '@inertiajs/react';
import Toaster from '@/components/common/Toaster';

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10">
            <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold text-indigo-600">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">D</span>
                Donation Club
            </Link>

            <div className="w-full max-w-md">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </div>

            <Toaster />
        </div>
    );
}
