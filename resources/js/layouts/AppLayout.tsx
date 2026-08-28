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
    { label: 'Returns & Rewards', href: 'returns.index', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'My Rank', href: 'rank.index', icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0' },
    { label: 'Support Fund', href: 'fund.index', icon: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H17.25M4.5 12.75c0-.621.504-1.125 1.125-1.125H9.75m-6 7.5h2.25m6-9.75h2.25' },
    { label: 'Withdrawals', href: 'withdrawals.index', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' },
];

const securityLinks = [
    { label: 'Profile', href: 'profile.edit', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { label: 'KYC Verification', href: 'kyc.index', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user!;
    const { company } = page.props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const logout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const NavLink = ({ item }: { item: typeof navigation[0] }) => {
        const active = route().current(item.href);
        return (
            <Link
                href={route(item.href)}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                    'group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                    active
                        ? 'bg-amber-500 text-gray-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'text-gray-400 hover:bg-gray-800/70 hover:text-white',
                    isCollapsed ? 'justify-center' : 'gap-3'
                )}
            >
                <svg className={cn('h-5 w-5 shrink-0', active ? 'text-gray-900' : 'text-gray-500 group-hover:text-amber-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {!isCollapsed && <span>{item.label}</span>}
            </Link>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ── Sidebar ── */}
            <aside className={cn(
                'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-800/50 bg-gray-950 transition-all duration-300 lg:translate-x-0',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                isCollapsed ? 'w-[70px]' : 'w-[240px]'
            )}>
                {/* Logo */}
                <div className={cn('flex h-16 shrink-0 items-center border-b border-gray-800/50', isCollapsed ? 'justify-center px-0' : 'justify-between px-5')}>
                    <Link href={route('home')} className={cn('flex items-center gap-2.5', isCollapsed && 'hidden')}>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-sm font-black text-gray-900 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                            {company.name.charAt(0)}
                        </span>
                        <span className="text-sm font-black text-white">{company.name}</span>
                    </Link>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            {isCollapsed
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            }
                        </svg>
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                    {!isCollapsed && (
                        <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-600">Main Menu</p>
                    )}
                    {navigation.map((item) => <NavLink key={item.href} item={item} />)}

                    <div className="my-4 border-t border-gray-800/50" />
                    {!isCollapsed && (
                        <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-600">Account</p>
                    )}
                    {securityLinks.map((item) => <NavLink key={item.href} item={item} />)}
                </nav>

                {/* User footer */}
                <div className={cn('border-t border-gray-800/50 p-3', isCollapsed && 'flex justify-center')}>
                    <button
                        onClick={logout}
                        title={isCollapsed ? 'Sign out' : undefined}
                        className={cn('flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 transition-all hover:bg-gray-800/70 hover:text-red-400', isCollapsed ? 'justify-center' : 'gap-3')}
                    >
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-30 bg-gray-950/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Main ── */}
            <div className={cn('flex min-w-0 flex-1 flex-col transition-all duration-300', isCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[240px]')}>
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
                    <button
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <div className="ml-auto flex items-center gap-3">
                        {/* Quick action */}
                        <Link
                            href={route('deposits.index')}
                            className="hidden items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-gray-900 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] sm:flex"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            New Deposit
                        </Link>

                        {/* Profile dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-gray-200 hover:bg-gray-100"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-xs font-black text-amber-700">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60">
                                        <div className="border-b border-gray-50 bg-gray-50/80 px-4 py-3">
                                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">Signed in as</p>
                                            <p className="mt-0.5 truncate text-sm font-bold text-gray-900">{user.email}</p>
                                        </div>
                                        {[
                                            { label: 'Dashboard', href: route('dashboard') },
                                            { label: 'Profile Settings', href: route('profile.edit') },
                                        ].map((item) => (
                                            <Link key={item.label} href={item.href} onClick={() => setProfileOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700">
                                                {item.label}
                                            </Link>
                                        ))}
                                        <div className="border-t border-gray-50">
                                            <button onClick={logout} className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            </div>

            <Toaster />
        </div>
    );
}
