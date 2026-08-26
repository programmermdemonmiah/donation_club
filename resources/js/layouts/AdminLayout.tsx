import { Link, router, usePage } from '@inertiajs/react';
import { useState, type PropsWithChildren } from 'react';
import Toaster from '@/components/common/Toaster';
import type { PageProps } from '@/types';
import { cn } from '@/utils/format';

const navigation = [
    { label: 'Dashboard', route: 'admin.dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { label: 'Users', route: 'admin.users.index', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
    { label: 'KYC Documents', route: 'admin.kyc.index', icon: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-3V2h-2v2H8V2H6v2H3v18h18V4zm-2 16H5V9h14v11z' },
    { label: 'Deposits', route: 'admin.deposits.index', icon: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' },
    { label: 'Wallets', route: 'admin.wallets.index', icon: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
    { label: 'Wallet Transactions', route: 'admin.wallets.transactions', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
    { label: 'Commissions', route: 'admin.commissions.index', icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
    { label: 'Returns / Rewards', route: 'admin.returns.index', icon: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z' },
    { label: 'Ranks', route: 'admin.ranks.index', icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
    { label: 'Funds', route: 'admin.funds.index', icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-1-12h2v2h-2zm0 4h2v6h-2z' },
    { label: 'Withdrawals', route: 'admin.withdrawals.index', icon: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z' },
    { label: 'Settings', route: 'admin.settings.edit', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' },
    { label: 'Audit Logs', route: 'admin.audit-logs.index', icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' },
];

export default function AdminLayout({ children }: PropsWithChildren) {
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
        <div className="flex min-h-screen bg-gray-900/[0.02]">
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
                        <span>Admin Panel</span>
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
                        const active = route().current(item.route);
                        return (
                            <Link
                                key={item.route}
                                href={route(item.route)}
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
                </nav>
                <div className="shrink-0 border-t border-gray-800 px-3 py-3">
                    <Link
                        href={route('dashboard')}
                        title={isCollapsed ? "Member View" : undefined}
                        className={cn("flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white", isCollapsed ? "justify-center" : "gap-3")}
                    >
                        <svg className="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        {!isCollapsed && <span>Member View</span>}
                    </Link>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-30 bg-gray-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className={cn("flex min-w-0 flex-1 flex-col transition-all duration-300", isCollapsed ? "lg:ml-20" : "lg:ml-60")}>
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
                    <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="relative pl-4">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2 rounded-full text-sm hover:ring-2 hover:ring-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 ring-2 ring-white">
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
                                        <Link href={route('admin.settings.edit')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Settings
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
