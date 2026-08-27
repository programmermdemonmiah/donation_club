import PublicLayout from '@/layouts/PublicLayout';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Home() {
    const page = usePage<PageProps & { 
        stats: { total_deposits: number; total_amount: string; members: number }; 
        depositRules: { min: string; max: string } 
    }>();
    const { company } = page.props;

    const stats = [
        { 
            label: 'Completed Contributions', 
            value: page.props.stats.total_deposits.toLocaleString(),
            prefix: '',
            suffix: '',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        },
        { 
            label: 'Community Total', 
            value: Number(page.props.stats.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            prefix: '$',
            suffix: '',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
        },
        { 
            label: 'Active Members', 
            value: page.props.stats.members.toLocaleString(),
            prefix: '',
            suffix: '+',
            icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477'
        },
    ];

    const features = [
        {
            title: 'Accessible Contributions',
            description: `Contribute between ${page.props.depositRules.min} and ${page.props.depositRules.max} per deposit. Designed to be fair and equal for every member, regardless of background.`,
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            accent: 'bg-slate-900'
        },
        {
            title: 'Transparent Ledger',
            description: 'Every confirmed deposit receives a permanent public sequence number. Complete transparency with no hidden books or private records.',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            accent: 'bg-emerald-700'
        },
        {
            title: 'Community Governance',
            description: 'Members participate in decision-making through transparent voting. Ranks reflect contribution history, not financial investment.',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            accent: 'bg-amber-700'
        },
        {
            title: 'Referral Network',
            description: 'Build a team across up to 10 generations. Earn recognition through community participation, not recruitment incentives.',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            accent: 'bg-indigo-700'
        },
        {
            title: 'Support Fund',
            description: 'Qualified members may access community support funds. Distributions are discretionary, transparent, and administered by elected members.',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            accent: 'bg-rose-700'
        },
        {
            title: 'Open Source Values',
            description: 'Built on open principles. Our ledger, rules, and governance are publicly auditable. No proprietary algorithms or hidden mechanisms.',
            icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
            accent: 'bg-violet-700'
        },
    ];

    const steps = [
        { number: '01', title: 'Create Account', description: 'Register with your email. No KYC required for basic participation.' },
        { number: '02', title: 'Make a Deposit', description: `Contribute between ${page.props.depositRules.min}–${page.props.depositRules.max}. Your deposit enters the public sequence.` },
        { number: '03', title: 'Track Progress', description: 'Watch your sequence number advance. Transparency at every step.' },
        { number: '04', title: 'Participate', description: 'Engage with the community, refer others, and qualify for support funds.' },
    ];

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
                
                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700 border border-slate-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Live Ledger Active
                        </span>
                        
                        <h1 className="mt-8 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
                            <span className="font-normal">{company.name}</span>
                            <br />
                            <span className="font-medium">Community Contribution Platform</span>
                        </h1>
                        
                        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            A transparent, member-governed platform for voluntary contributions. 
                            Every deposit is recorded in a public sequential ledger. 
                            No hidden algorithms. No guaranteed returns. Just community.
                        </p>
                        
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link 
                                href={route('register')} 
                                className="group relative inline-flex items-center justify-center rounded-md bg-slate-900 px-8 py-3.5 text-base font-medium text-white transition-all duration-200 hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                            >
                                Join the Community
                                <svg className="ml-3 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link 
                                href={route('pages.how-it-works')} 
                                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-8 py-3.5 text-base font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            >
                                How It Works
                            </Link>
                        </div>
                    </div>

                    {/* Live Stats Preview */}
                    <div className="mt-16 mx-auto max-w-3xl">
                        <div className="rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Ledger Preview</h3>
                                <Link href={route('public.deposits')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                    View Full Ledger →
                                </Link>
                            </div>
                            <div className="space-y-3" role="list" aria-label="Recent contributions">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-t border-slate-100 last:border-0 transition-colors hover:bg-slate-50 rounded-lg px-2 -mx-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono text-slate-400">#{String(1247 - i).padStart(6, '0')}</span>
                                            <span className="text-sm text-slate-500">•</span>
                                            <span className="text-sm font-medium text-slate-700">$${(Math.random() * 10 + 1).toFixed(2)}</span>
                                        </div>
                                        <time className="text-xs text-slate-400 font-mono" dateTime="2024-01-15T14:30:00Z">
                                            {new Date(Date.now() - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </time>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-slate-900 text-white" aria-labelledby="stats-heading">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
                    <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-3">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4" aria-hidden="true">
                                    <svg className="h-7 w-7 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                                    </svg>
                                </div>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-sm font-medium text-white/50">{stat.prefix}</span>
                                    <dt className="text-4xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">{stat.value}</dt>
                                    <span className="text-sm font-medium text-white/50 self-end">{stat.suffix}</span>
                                </div>
                                <dd className="mt-2 text-sm text-white/60 font-medium">{stat.label}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white" aria-labelledby="how-heading">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <header className="mx-auto max-w-2xl text-center mb-16">
                        <h2 id="how-heading" className="text-3xl font-light tracking-tight text-slate-900 sm:text-4xl">
                            How It Works
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Four simple steps to participate in the community
                        </p>
                    </header>
                    
                    <div className="relative">
                        <div className="absolute hidden lg:block left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
                        
                        <ol className="grid grid-cols-1 gap-12 lg:grid-cols-2" role="list">
                            {steps.map((step, index) => (
                                <li key={step.number} className="relative">
                                    <div className="relative lg:pr-12 lg:text-right" style={{ '--index': index + 1 }}>
                                        <span className="inline-block w-12 h-12 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-lg flex items-center justify-center mb-4 lg:mx-auto lg:mb-4">
                                            {step.number}
                                        </span>
                                        <h3 className="text-xl font-medium text-slate-900 mb-2">{step.title}</h3>
                                        <p className="text-slate-600 leading-relaxed lg:max-w-md lg:mx-auto">{step.description}</p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-1/2 top-16 bottom-0 w-px bg-slate-200 -translate-x-1/2 lg:hidden" />
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-slate-50" aria-labelledby="features-heading">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <header className="mx-auto max-w-2xl text-center mb-16">
                        <h2 id="features-heading" className="text-3xl font-light tracking-tight text-slate-900 sm:text-4xl">
                            Platform Features
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Built on principles of transparency, fairness, and community governance
                        </p>
                    </header>
                    
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
                        {features.map((feature, index) => (
                            <li key={index} className="group">
                                <article className="h-full rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300 mb-4" aria-hidden="true">
                                        <svg className="h-6 w-6 text-slate-900 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                                </article>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Disclosure Section */}
            <section className="bg-slate-900 text-white" aria-labelledby="disclosure-heading">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 uppercase tracking-wider mb-4">
                                    <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Important Disclosure
                                </div>
                                <h2 id="disclosure-heading" className="text-2xl font-light tracking-tight mb-3">
                                    Contributions are voluntary donations — not investments
                                </h2>
                                <p className="text-white/70 leading-relaxed max-w-2xl">
                                    Any return, reward, or commission is discretionary, never guaranteed, and only paid when configured and approved by administrators. 
                                    Past performance does not indicate future results. Please review our
                                    <Link href={route('pages.risk-disclosure')} className="font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors">
                                        Risk & Disclosure page
                                    </Link>
                                    before participating.
                                </p>
                            </div>
                            <Link 
                                href={route('pages.risk-disclosure')} 
                                className="flex-shrink-0 inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                            >
                                Read Full Disclosure
                                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-white" aria-labelledby="cta-heading">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-12 lg:p-16 text-center">
                        <h2 id="cta-heading" className="text-3xl font-light tracking-tight text-slate-900 sm:text-4xl">
                            Ready to Join?
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                            Become part of a transparent community. No hidden fees, no guaranteed returns — just voluntary contributions and public accountability.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link 
                                href={route('register')} 
                                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-8 py-3.5 text-base font-medium text-white transition-all duration-200 hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                            >
                                Create Free Account
                                <svg className="ml-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </Link>
                            <Link 
                                href={route('public.deposits')} 
                                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-8 py-3.5 text-base font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            >
                                View Public Ledger
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}