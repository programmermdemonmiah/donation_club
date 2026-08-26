import { Link, usePage, Head } from '@inertiajs/react';
import Toaster from '@/components/common/Toaster';
import type { PageProps } from '@/types';

export default function PublicLayout({ children, title = '' }: { children: React.ReactNode, title?: string }) {
    const page = usePage<PageProps>();
    const user = page.props.auth?.user;
    const { company, chat } = page.props;

    const nav = [
        { href: route('public.deposits'), label: 'Deposits' },
        { href: route('pages.about'), label: 'About' },
        { href: route('pages.how-it-works'), label: 'How It Works' },
        { href: route('pages.faq'), label: 'FAQ' },
        { href: route('pages.risk-disclosure'), label: 'Risk Disclosure' },
        { href: route('pages.contact'), label: 'Contact' },
    ];

    const pageTitle = title ? `${title} | ${company.name}` : company.name;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={`${company.name} is a global community contribution platform.`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={`${company.name} is a global community contribution platform.`} />
            </Head>

            <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 shadow-sm backdrop-blur-lg transition-all">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-2 text-lg font-bold text-indigo-600">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">{company.name.charAt(0)}</span>
                        {company.name}
                    </Link>
                    <nav className="hidden items-center gap-1 md:flex">
                        {nav.map((item) => (
                            <Link key={item.label} href={item.href} className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link
                                href={user.is_admin ? '/admin' : route('dashboard')}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Log in
                                </Link>
                                <Link href={route('register')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>

            <footer className="mt-auto border-t border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} {company.name}. Contributions are voluntary and returns are never guaranteed.
                    </p>
                    <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                        <Link href={route('pages.terms')} className="hover:text-gray-800">Terms</Link>
                        <Link href={route('pages.privacy')} className="hover:text-gray-800">Privacy Policy</Link>
                        <Link href={route('pages.risk-disclosure')} className="hover:text-gray-800">Risk / Disclosure</Link>
                    </nav>
                </div>
            </footer>

            <Toaster />
        </div>
    );
}
