import { Link, usePage, Head } from '@inertiajs/react';
import Toaster from '@/components/common/Toaster';
import type { PageProps } from '@/types';
import { useState, useEffect } from 'react';

export default function PublicLayout({ children, title = '' }: { children: React.ReactNode; title?: string }) {
    const page = usePage<PageProps>();
    const user = page.props.auth?.user;
    const { company } = page.props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const nav = [
        { href: route('public.deposits'), label: 'Donors', name: 'public.deposits' },
        { href: route('pages.about'), label: 'About', name: 'pages.about' },
        { href: route('pages.how-it-works'), label: 'How It Works', name: 'pages.how-it-works' },
        { href: route('pages.faq'), label: 'FAQ', name: 'pages.faq' },
        { href: route('pages.risk-disclosure'), label: 'Risk Disclosure', name: 'pages.risk-disclosure' },
        { href: route('pages.contact'), label: 'Contact', name: 'pages.contact' },
    ];

    const pageTitle = title ? `${title} — ${company.name}` : company.name;

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={`${company.name} — A transparent, member-governed community contribution platform.`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={`${company.name} — transparent, fair, community governed.`} />
            </Head>

            {/* ── Navbar - Full Fixed Complete Design ────────────────── */}
            <header className={`sticky top-0 z-50 w-full bg-white ${scrolled ? 'shadow-lg shadow-gray-100/70 border-b border-gray-100' : 'border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'}`}>

                {/* ===== Mobile Header - Logo BIG (full width cover) ===== */}
                <div className="relative mx-auto flex h-[72px] max-w-screen-xl items-center justify-between gap-2 px-2 sm:h-[76px] sm:gap-3 sm:px-3 lg:hidden">
                    {/* Left: Logo - BIG full header width cover */}
                    <Link href={route('home')} className="flex flex-1 min-w-0 items-center">
                        <div className="flex w-full max-w-[380px] items-center overflow-hidden sm:max-w-[320px]">
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="h-auto max-h-[54px] w-full object-cover sm:max-h-[58px]" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c8a84e]/40 bg-[#0f4d2a] text-[13px] leading-none">👐</div>
                                    <span className="text-[13px] font-black leading-none tracking-[0.02em] text-[#0f3d2b]">DONATIONCLUB</span>
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Right: Login | Register - as image */}
                    <div className="flex shrink-0 items-center gap-1">
                        {user ? (
                            <Link
                                href={user.is_admin ? '/admin' : route('dashboard')}
                                className="rounded-[6px] border border-gray-800 bg-white px-2.5 py-[5px] text-[10px] font-bold leading-none text-gray-800 shadow-sm hover:bg-gray-50"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex overflow-hidden rounded-[6px] border border-gray-800 bg-white shadow-sm">
                                <Link href={route('login')} className="px-2 py-[5px] text-[10px] font-semibold leading-none text-gray-800 hover:bg-gray-50 sm:px-2.5 sm:text-[11px]">Login</Link>
                                <span className="w-px bg-gray-800"></span>
                                <Link href={route('register')} className="px-2 py-[5px] text-[10px] font-semibold leading-none text-gray-800 hover:bg-gray-50 sm:px-2.5 sm:text-[11px]">Register</Link>
                            </div>
                        )}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileOpen}
                            className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-[#0f4d2a] text-white shadow-sm transition-colors hover:bg-[#0a341c] sm:h-8 sm:w-8"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ===== Desktop Header - Logo BIG (full width) / Logo B before nav ===== */}
                <div className="relative mx-auto hidden h-[88px] max-w-screen-xl items-center justify-between gap-4 px-6 lg:flex xl:px-8">
                    {/* Brand - Logo B BIG before nav menus */}
                    <Link href={route('home')} className="flex shrink-0 items-center">
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="h-auto max-h-[72px] w-[320px] object-cover xl:w-[380px]" />
                        ) : (
                            <div className="flex items-center gap-3 group">
                                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[2px] border-[#c8a84e] bg-[#0f4d2a] shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                                    <span className="text-base">🤲</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[19px] font-black leading-none tracking-[0.02em] text-[#0f3d2b]">DONATIONCLUB</span>
                                    <span className="mt-[1px] text-[7px] font-bold leading-none tracking-[0.2em] text-[#b89a3e]">TOGETHER FOR A BETTER TOMORROW</span>
                                    <div className="mt-[4px] flex w-full items-center justify-center gap-1.5">
                                        <span className="h-px w-[38px] bg-[#c8a84e]/60"></span>
                                        <span className="h-[6px] w-[6px] rotate-45 border border-[#c8a84e] bg-[#c8a84e]/10"></span>
                                        <span className="h-px w-[38px] bg-[#c8a84e]/60"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Link>

                    {/* Navigation - Center */}
                    <nav className="flex items-center gap-1">
                        {nav.map((item) => {
                            const active = typeof route !== 'undefined' && route().current(item.name);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`relative rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                                        active
                                            ? 'bg-[#0f4d2a] text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-[#0f4d2a]/5 hover:text-[#0f4d2a]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Auth - Right */}
                    <div className="flex shrink-0 items-center gap-2.5">
                        {user ? (
                            <Link
                                href={user.is_admin ? '/admin' : route('dashboard')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f4d2a] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0a341c]"
                            >
                                Dashboard <span className="text-white/70">→</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <div className="flex overflow-hidden rounded-lg border border-[#0f4d2a] bg-white shadow-sm">
                                    <Link href={route('login')} className="px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">Login</Link>
                                    <span className="w-px bg-[#0f4d2a]"></span>
                                    <Link href={route('register')} className="bg-[#0f4d2a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a341c] transition-colors">Register</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Dropdown - Full */}
                {mobileOpen && (
                    <div className="border-t border-gray-100 bg-white shadow-xl lg:hidden animate-[fadeIn_0.2s_ease]">
                        <nav className="space-y-0.5 px-3 py-3">
                            {nav.map((item) => {
                                const active = typeof route !== 'undefined' && route().current(item.name);
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                                            active ? 'bg-[#0f4d2a] text-white' : 'text-gray-700 hover:bg-[#0f4d2a]/5 hover:text-[#0f4d2a]'
                                        }`}
                                    >
                                        {item.label}
                                        <span className={`text-xs ${active ? 'text-white/60' : 'text-gray-300'}`}>›</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="border-t border-gray-100 bg-gray-50/70 px-3 py-3">
                            {user ? (
                                <Link
                                    href={user.is_admin ? '/admin' : route('dashboard')}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex w-full items-center justify-center rounded-lg bg-[#0f4d2a] px-4 py-3 text-sm font-bold text-white shadow"
                                >
                                    Go to Dashboard →
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-lg bg-[#0f4d2a] px-4 py-3 text-center text-sm font-bold text-white shadow hover:bg-[#0a341c]"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                            <p className="mt-3 text-center text-[11px] font-medium text-gray-400">Together for a better tomorrow</p>
                        </div>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="flex-1 w-full">{children}</main>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer className="border-t border-blue-900/50 bg-blue-950">
                <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-base font-black text-white shadow-[0_0_16px_rgba(37,99,235,0.3)]">
                                    {company.name.charAt(0)}
                                </span>
                                <span className="text-lg font-black text-white">{company.name}</span>
                            </Link>
                            <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-blue-100/70">
                                A transparent, member-governed platform for voluntary community contributions. Registered in England & Wales.
                            </p>
                            <div className="mt-5 space-y-1.5">
                                {[
                                    `Reg. No: ${company.registration}`,
                                    company.address,
                                ].map((line) => (
                                    <p key={line} className="text-xs font-medium text-blue-200/60">{line}</p>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Platform</h4>
                            <ul className="mt-4 space-y-2.5">
                                {[
                                    { href: route('public.deposits'), label: 'Public Ledger' },
                                    { href: route('pages.how-it-works'), label: 'How It Works' },
                                    { href: route('pages.about'), label: 'About Us' },
                                    { href: route('pages.faq'), label: 'FAQs' },
                                    { href: route('pages.contact'), label: 'Contact' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-sm font-medium text-blue-100/80 transition-colors hover:text-white">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Legal</h4>
                            <ul className="mt-4 space-y-2.5">
                                {[
                                    { href: route('pages.terms'), label: 'Terms & Conditions' },
                                    { href: route('pages.privacy'), label: 'Privacy Policy' },
                                    { href: route('pages.risk-disclosure'), label: 'Risk Disclosure' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-sm font-medium text-blue-100/80 transition-colors hover:text-white">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <Link href={route('register')}
                                    className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all duration-300 hover:bg-blue-500">
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    Join {company.name} →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-blue-900/30 bg-blue-950/80">
                    <div className="mx-auto flex max-w-screen-xl flex-col gap-2 px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <p className="text-xs font-medium text-blue-200/80">
                            © {new Date().getFullYear()} <span className="font-black text-blue-400">{company.name}</span>. All rights reserved. All donations are voluntary — no guarantees.
                        </p>
                        <p className="text-xs font-medium text-blue-200/60">
                            Regulated · Transparent · Community-Governed
                        </p>
                    </div>
                </div>
            </footer>

            <Toaster />
        </div>
    );
}
