import { Link, router, usePage } from '@inertiajs/react';
import { useState, type PropsWithChildren } from 'react';
import Toaster from '@/components/common/Toaster';
import type { PageProps } from '@/types';
import { cn } from '@/utils/format';

const navigation = [
    { label: 'Dashboard', route: 'admin.dashboard' },
    { label: 'Users', route: 'admin.users.index' },
    { label: 'Deposits', route: 'admin.deposits.index' },
    { label: 'Wallets', route: 'admin.wallets.index' },
    { label: 'Wallet Transactions', route: 'admin.wallets.transactions' },
    { label: 'Commissions', route: 'admin.commissions.index' },
    { label: 'Returns / Rewards', route: 'admin.returns.index' },
    { label: 'Ranks', route: 'admin.ranks.index' },
    { label: 'Funds', route: 'admin.funds.index' },
    { label: 'Withdrawals', route: 'admin.withdrawals.index' },
    { label: 'Settings', route: 'admin.settings.edit' },
    { label: 'Audit Logs', route: 'admin.audit-logs.index' },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user!;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="flex min-h-screen bg-gray-900/[0.02]">
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-60 transform bg-gray-900 transition-transform lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-5">
                    <Link href={route('home')} className="flex items-center gap-2 text-base font-bold text-white">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-sm">D</span>
                        Admin Panel
                    </Link>
                </div>
                <nav className="space-y-1 px-3 py-4">
                    {navigation.map((item) => {
                        const active = route().current(item.route);
                        return (
                            <Link
                                key={item.route}
                                href={route(item.route)}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'block rounded-lg px-3 py-2 text-sm font-medium',
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <div className="my-3 border-t border-gray-800" />
                    <Link href={route('dashboard')} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
                        ← Member View
                    </Link>
                </nav>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-30 bg-gray-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
                    <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 sm:block">
                            Administrator
                        </span>
                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                        <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-rose-600">
                            Log out
                        </button>
                    </div>
                </header>
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>

            <Toaster />
        </div>
    );
}
