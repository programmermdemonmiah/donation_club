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
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const nav = [
        { href: route('public.deposits'), label: 'Deposits' },
        { href: route('pages.about'), label: 'About' },
        { href: route('pages.how-it-works'), label: 'How It Works' },
        { href: route('pages.faq'), label: 'FAQ' },
        { href: route('pages.risk-disclosure'), label: 'Risk Disclosure' },
        { href: route('pages.contact'), label: 'Contact' },
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

            {/* ── Navbar ─────────────────────────────────────────── */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${
                scrolled
                    ? 'border-b border-gray-800/80 bg-gray-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl'
                    : 'border-b border-gray-800 bg-gray-950'
            }`}>
                <div className="mx-auto flex h-[68px] max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Logo */}
                    <Link href={route('home')} className="group flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-base font-black text-gray-900 shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(245,158,11,0.6)]">
                            {company.name.charAt(0)}
                        </span>
                        <span className="text-base font-black tracking-wide text-white transition-colors group-hover:text-amber-400">
                            {company.name}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-0.5 lg:flex">
                        {nav.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="relative rounded-lg px-4 py-2 text-sm font-semibold text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* CTAs */}
                    <div className="hidden items-center gap-3 lg:flex">
                        {user ? (
                            <Link
                                href={user.is_admin ? '/admin' : route('dashboard')}
                                className="group relative overflow-hidden rounded-xl bg-amber-500 px-5 py-2 text-sm font-black tracking-wide text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.55)]"
                            >
                                <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-bold text-gray-400 transition-colors hover:text-white">
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="group relative overflow-hidden rounded-xl bg-amber-500 px-6 py-2 text-sm font-black tracking-wide text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.55)]"
                                >
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white lg:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="border-t border-gray-800 bg-gray-950 lg:hidden">
                        <div className="space-y-1 px-4 py-4">
                            {nav.map((item) => (
                                <Link key={item.label} href={item.href}
                                    className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-gray-800 hover:text-amber-400"
                                    onClick={() => setMobileOpen(false)}>
                                    {item.label}
                                </Link>
                            ))}
                            <div className="border-t border-gray-800 pt-4 pb-1 space-y-2">
                                {user ? (
                                    <Link href={user.is_admin ? '/admin' : route('dashboard')}
                                        className="block rounded-xl bg-amber-500 px-4 py-2.5 text-center text-sm font-black text-gray-900">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="block py-2 text-center text-sm font-bold text-gray-400">Log in</Link>
                                        <Link href={route('register')} className="block rounded-xl bg-amber-500 px-4 py-2.5 text-center text-sm font-black text-gray-900">Join Now</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="flex-1 w-full">{children}</main>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer className="border-t border-gray-800 bg-gray-950">
                {/* Main footer */}
                <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div className="lg:col-span-2">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-base font-black text-gray-900 shadow-[0_0_16px_rgba(245,158,11,0.3)]">
                                    {company.name.charAt(0)}
                                </span>
                                <span className="text-lg font-black text-white">{company.name}</span>
                            </Link>
                            <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-gray-500">
                                A transparent, member-governed platform for voluntary community contributions. Registered in England & Wales.
                            </p>
                            <div className="mt-5 space-y-1.5">
                                {[
                                    `Reg. No: ${company.registration}`,
                                    company.address,
                                ].map((line) => (
                                    <p key={line} className="text-xs font-medium text-gray-600">{line}</p>
                                ))}
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Platform</h4>
                            <ul className="mt-4 space-y-2.5">
                                {[
                                    { href: route('public.deposits'), label: 'Public Ledger' },
                                    { href: route('pages.how-it-works'), label: 'How It Works' },
                                    { href: route('pages.about'), label: 'About Us' },
                                    { href: route('pages.faq'), label: 'FAQs' },
                                    { href: route('pages.contact'), label: 'Contact' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-sm font-medium text-gray-500 transition-colors hover:text-amber-400">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Legal</h4>
                            <ul className="mt-4 space-y-2.5">
                                {[
                                    { href: route('pages.terms'), label: 'Terms & Conditions' },
                                    { href: route('pages.privacy'), label: 'Privacy Policy' },
                                    { href: route('pages.risk-disclosure'), label: 'Risk Disclosure' },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-sm font-medium text-gray-500 transition-colors hover:text-amber-400">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                <Link href={route('register')}
                                    className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-amber-500 py-3 text-sm font-black text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-300 hover:bg-amber-400">
                                    <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
                                    Join {company.name} →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800/60 bg-gray-950/80">
                    <div className="mx-auto flex max-w-screen-xl flex-col gap-2 px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <p className="text-xs font-medium text-gray-600">
                            © {new Date().getFullYear()} <span className="font-black text-amber-500">{company.name}</span>. All rights reserved. Contributions are voluntary — returns are never guaranteed.
                        </p>
                        <p className="text-xs font-medium text-gray-700">
                            Regulated · Transparent · Community-Governed
                        </p>
                    </div>
                </div>
            </footer>

            <Toaster />
        </div>
    );
}
