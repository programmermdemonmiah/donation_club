import { Link, router, usePage } from '@inertiajs/react';
import { useState, type PropsWithChildren } from 'react';
import Toaster from '@/components/common/Toaster';
import type { PageProps } from '@/types';
import { cn } from '@/utils/format';

const navigation = [
    { label: 'Dashboard', href: 'dashboard', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75' },
    { label: 'Deposits', href: 'deposits.index', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33' },
    { label: 'Wallet', href: 'wallet.index', icon: 'M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3' },
    { label: 'Transactions', href: 'transactions.index', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { label: 'Referrals', href: 'referrals.index', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
    { label: 'Commissions', href: 'commissions.index', icon: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941' },
    { label: 'Returns / Rewards', href: 'returns.index', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Rank', href: 'rank.index', icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0' },
    { label: 'Support Fund', href: 'fund.index', icon: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H17.25M4.5 12.75c0-.621.504-1.125 1.125-1.125H9.75m-6 7.5h2.25m6-9.75h2.25' },
    { label: 'Withdrawals', href: 'withdrawals.index', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user!;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const logout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 transition-all duration-300 lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    isCollapsed ? 'w-20' : 'w-60'
                )}
            >
                <div className={cn("flex h-16 shrink-0 items-center justify-between border-b border-gray-800", isCollapsed ? "px-0 justify-center" : "px-5")}>
                    <Link href={route('home')} className={cn("flex items-center gap-2 text-base font-bold text-white", isCollapsed && "hidden")}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm">D</span>
                        <span>Donation Club</span>
                    </Link>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
                            {isCollapsed ? (
                                <path d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z" />
                            ) : (
                                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                            )}
                        </svg>
                    </button>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {navigation.map((item) => {
                        const active = route().current(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                onClick={() => setSidebarOpen(false)}
                                title={isCollapsed ? item.label : undefined}
                                className={cn(
                                    'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                    isCollapsed ? 'justify-center' : 'gap-3'
                                )}
                            >
                                <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
                                    <path d={item.icon} />
                                </svg>
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                    <div className="my-3 border-t border-gray-800" />
                    {!isCollapsed && <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Security</p>}
                    <Link
                        href={route('profile.edit')}
                        onClick={() => setSidebarOpen(false)}
                        title={isCollapsed ? "Profile" : undefined}
                        className={cn('group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', route().current('profile.edit') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white', isCollapsed ? 'justify-center' : 'gap-3')}
                    >
                        <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        {!isCollapsed && <span>Profile</span>}
                    </Link>
                    <Link
                        href={route('kyc.index')}
                        onClick={() => setSidebarOpen(false)}
                        title={isCollapsed ? "KYC Verification" : undefined}
                        className={cn('group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', route().current('kyc.index') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white', isCollapsed ? 'justify-center' : 'gap-3')}
                    >
                        <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-3V2h-2v2H8V2H6v2H3v18h18V4zm-2 16H5V9h14v11z" /></svg>
                        {!isCollapsed && <span>KYC Verification</span>}
                    </Link>
                </nav>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-30 bg-gray-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main */}
            <div className={cn("flex min-w-0 flex-1 flex-col transition-all duration-300", isCollapsed ? "lg:ml-20" : "lg:ml-60")}>
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
                    <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="relative border-l border-gray-200 pl-4">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2 rounded-full text-sm hover:ring-2 hover:ring-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 ring-2 ring-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="hidden font-medium text-gray-700 sm:block">{user.name}</span>
                                <svg className="hidden h-4 w-4 text-gray-400 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {profileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                                    <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-900">
                                            <p>Signed in as</p>
                                            <p className="truncate font-medium">{user.email}</p>
                                        </div>
                                        <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Your Profile
                                        </Link>
                                        <Link href={route('dashboard')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Dashboard
                                        </Link>
                                        <div className="border-t border-gray-100"></div>
                                        <button
                                            onClick={logout}
                                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>

            <Toaster />
        </div>
    );
}
