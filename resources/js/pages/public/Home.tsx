import PublicLayout from '@/layouts/PublicLayout';
import Button from '@/components/ui/Button';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Home() {
    const page = usePage<PageProps & { stats: { total_deposits: number; total_amount: string; members: number }; depositRules: { min: string; max: string } }>();
    const { company } = page.props;

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section 
                className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 px-4 text-center shadow-2xl sm:px-8"
                style={{ paddingTop: '6rem', paddingBottom: '6rem' }}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center">
                    <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-normal text-white sm:text-6xl sm:leading-normal">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">{company.name}</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100/90 sm:text-xl">
                        Members make small voluntary contributions, build teams through referrals, and may qualify for community rewards and support funds.
                        Every completed contribution is recorded in a public, sequential ledger.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href={route('register')} className="group relative inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-indigo-900 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-indigo-50 hover:shadow-indigo-500/30">
                            Join the Club
                            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                        <Link href={route('pages.how-it-works')} className="inline-flex items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-900/50 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-indigo-800/60 hover:text-indigo-100">
                            How It Works
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-20 mx-auto -mt-12 grid max-w-5xl gap-5 px-4 sm:grid-cols-3">
                <Stat label="Completed contributions" value={String(page.props.stats.total_deposits)} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <Stat label="Community total" value={`$${Number(page.props.stats.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <Stat label="Members" value={String(page.props.stats.members)} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </section>

            {/* Features Section */}
            <section className="mt-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose Us?</h2>
                    <p className="mt-4 text-lg text-gray-600">A completely transparent and fair ecosystem for all members.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    <Feature title="Small, accessible amounts" body={`Contribute between $${page.props.depositRules.min} and $${page.props.depositRules.max} per deposit. Fair and equal for every member.`} icon="M13 10V3L4 14h7v7l9-11h-7z" color="bg-blue-50 text-blue-600" />
                    <Feature title="Transparent sequence ledger" body="Every confirmed deposit gets a permanent public sequence number. No hidden books." icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" color="bg-emerald-50 text-emerald-600" />
                    <Feature title="Referral rewards & ranks" body="Grow your team across up to 10 generations. Ranks unlock eligibility for community support funds." icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" color="bg-purple-50 text-purple-600" />
                </div>
            </section>

            {/* Disclosure Section */}
            <section className="mt-24 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-amber-900">Important disclosure</h2>
                        <p className="mt-2 text-base leading-relaxed text-amber-800/80">
                            Contributions are voluntary donations to the community fund — not investments. Any return, reward or commission is
                            discretionary, never guaranteed, and only paid when configured and approved by administrators. See our{' '}
                            <Link href={route('pages.risk-disclosure')} className="font-semibold text-amber-900 underline hover:text-amber-700">Risk / Disclosure</Link> page before joining.
                        </p>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white/90 p-8 text-center shadow-xl shadow-gray-200/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-gray-900">{value}</div>
            <div className="mt-2 text-sm font-medium uppercase tracking-wider text-gray-500">{label}</div>
        </div>
    );
}

function Feature({ title, body, icon, color }: { title: string; body: string; icon: string; color: string }) {
    return (
        <div className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50">
            <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:rotate-6`}>
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-4 text-base leading-relaxed text-gray-600">{body}</p>
        </div>
    );
}
