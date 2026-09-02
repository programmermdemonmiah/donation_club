import PublicLayout from '@/layouts/PublicLayout';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════
   ANIMATED CANVAS — network particle mesh
═══════════════════════════════════════════════════════ */
function NetworkCanvas({ className = '' }: { className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext('2d'); if (!ctx) return;
        let raf: number;
        const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);
        const N = 70;
        const pts = Array.from({ length: N }, () => ({
            x: Math.random() * c.width, y: Math.random() * c.height,
            vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
            isGreen: Math.random() > 0.6,
        }));
        const loop = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > c.width) p.vx *= -1;
                if (p.y < 0 || p.y > c.height) p.vy *= -1;
                ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = p.isGreen ? 'rgba(16,185,129,.55)' : 'rgba(37,99,235,.55)'; ctx.fill();
            });
            for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                const d = Math.hypot(dx, dy);
                if (d < 130) {
                    ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                    const isGreenLink = pts[i].isGreen || pts[j].isGreen;
                    const base = isGreenLink ? `rgba(16,185,129,` : `rgba(37,99,235,`;
                    ctx.strokeStyle = `${base}${.13 * (1 - d / 130)})`; ctx.lineWidth = .7; ctx.stroke();
                }
            }
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={ref} className={`absolute inset-0 h-full w-full ${className}`} />;
}

/* ═══════════════════════════════════════════════════════
   SCROLL-IN FADE
═══════════════════════════════════════════════════════ */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    const [vis, setVis] = useState(false);
    const r = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.12 });
        if (r.current) o.observe(r.current);
        return () => o.disconnect();
    }, []);
    return (
        <div ref={r} style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════ */
function Counter({ end, prefix = '', suffix = '', label, sub }: { end: number; prefix?: string; suffix?: string; label: string; sub?: string }) {
    const [n, setN] = useState(0);
    const [active, setActive] = useState(false);
    const r = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); o.disconnect(); } }, { threshold: 0.3 });
        if (r.current) o.observe(r.current);
        return () => o.disconnect();
    }, []);
    useEffect(() => {
        if (!active || !end) return;
        const step = Math.max(1, Math.ceil(end / 80));
        let cur = 0;
        const t = setInterval(() => { cur = Math.min(cur + step, end); setN(cur); if (cur >= end) clearInterval(t); }, 16);
        return () => clearInterval(t);
    }, [active, end]);
    return (
        <div ref={r} className="flex flex-col items-center gap-1 text-center">
            <p className="text-5xl font-black tracking-tight text-white lg:text-6xl tabular-nums">
                {prefix}{n.toLocaleString()}{suffix}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[.22em] text-blue-600">{label}</p>
            {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MARQUEE TICKER
═══════════════════════════════════════════════════════ */
function Ticker({ items }: { items: string[] }) {
    const list = [...items, ...items];
    return (
        <div className="relative overflow-hidden border-y border-blue-600/20 bg-blue-900/80 py-3 backdrop-blur-sm">
            <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
                {list.map((item, i) => (
                    <span key={i} className="mx-8 text-xs font-bold uppercase tracking-[.18em] text-white">
                        ◆ {item}
                    </span>
                ))}
            </div>
            <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
interface HomeProps {
    stats?: { members: number; deposits: number; paid_out: number; countries: number };
    settings?: { min_deposit: string; max_deposit: string; commission_levels: number };
    latestDeposits?: Array<{ reference: string; amount: string; created_at: string }>;
}

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
    const FEATURES = [
    {
        icon: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371',
        title: 'Voluntary Contributions',
        desc: 'Contribute freely between $1–$10 per deposit. No lock-in, no hidden fees. Every deposit is timestamped on the public ledger permanently.',
        color: 'from-blue-600 to-emerald-500',
    },
    {
        icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
        title: 'Immutable Public Ledger',
        desc: 'Every transaction is publicly verifiable. 100% transparency — anyone can audit any deposit, any time, from anywhere in the world.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        title: '10-Generation Community',
        desc: 'Share voluntary donations across 10 levels of your community. Your team\'s contributions create shared support that grows over time.',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172',
        title: '9 Community Levels',
        desc: 'Progress through nine community levels. Each level unlocks broader support access, recognition, and community participation.',
        color: 'from-violet-500 to-purple-500',
    },
    {
        icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
        title: 'Full KYC Compliance',
        desc: 'AML/KYC verified platform. Upload your ID, get verified, and unlock higher limits. All documents encrypted with bank-grade security.',
        color: 'from-rose-500 to-pink-500',
    },
    {
        icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
        title: 'Enterprise-Grade Security',
        desc: 'Google Authenticator 2FA, encrypted sessions, CSRF protection. Your account and donation records are protected by industry-leading security.',
        color: 'from-slate-500 to-gray-600',
    },
];

const STEPS = [
    { n: '01', title: 'Create Account', desc: 'Register in minutes. Use a sponsor\'s referral code to join their team automatically.' },
    { n: '02', title: 'Make a Contribution', desc: 'Contribute $1–$10. Your deposit is recorded instantly on the immutable public ledger.' },
    { n: '03', title: 'Build Your Network', desc: 'Share your unique referral link. Every member you refer becomes part of your team — 10 levels deep.' },
    { n: '04', title: 'Qualify & Support', desc: 'Meet activity thresholds to unlock community recognition, level upgrades, and ongoing community support.' },
];

const TRUST_ITEMS = [
    'Registered England & Wales',
    'Transparent Public Ledger',
    'KYC/AML Compliant',
    '2FA Security',
    'Community Governed',
    '10-Generation Network',
    'Voluntary Contributions',
    'No Hidden Fees',
];

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function Home() {
    const page = usePage<PageProps & HomeProps>();
    const { stats, settings, latestDeposits = [], company } = page.props;

    // Typewriter effect for hero subtitle
    const phrases = ['Build Your Team.', 'Share Donations.', 'Grow Together.', 'Join the Movement.'];
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const target = phrases[phraseIdx];
        let timeout: ReturnType<typeof setTimeout>;
        if (!deleting && typed.length < target.length) {
            timeout = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 80);
        } else if (!deleting && typed.length === target.length) {
            timeout = setTimeout(() => setDeleting(true), 2200);
        } else if (deleting && typed.length > 0) {
            timeout = setTimeout(() => setTyped(typed.slice(0, -1)), 40);
        } else if (deleting && typed.length === 0) {
            setDeleting(false);
            setPhraseIdx((i) => (i + 1) % phrases.length);
        }
        return () => clearTimeout(timeout);
    }, [typed, deleting, phraseIdx]);

    return (
        <PublicLayout>

            {/* ══════════════════════════════════════════
                HERO — full viewport, split layout
            ══════════════════════════════════════════ */}
            <section className="relative flex min-h-screen overflow-hidden bg-blue-950">
                {/* Particle canvas */}
                <NetworkCanvas className="opacity-60" />

                {/* Left atmospheric glow - blue */}
                <div className="pointer-events-none absolute -left-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[130px]" />
                {/* Right glow - green */}
                <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
                {/* Top center glow - blue */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-[800px] -translate-x-1/2 bg-blue-600/8 blur-[80px]" />

                {/* Content */}
                <div className="relative mx-auto flex w-full max-w-screen-xl flex-col items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl text-center">

                        {/* Badge */}
                        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-blue-600/20 bg-blue-600/8 px-5 py-2 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-[.22em] text-blue-400/90">
                                {company.name} · Live Network · Est. 2024
                            </span>
                        </div>

                        {/* Main headline */}
                        <h1 className="text-[clamp(3rem,7.5vw,6rem)] font-black leading-[1.02] tracking-[-0.02em] text-white">
                            Donate Together.{' '}
                            <br className="hidden sm:block" />
                            <span className="relative inline-block">
                                <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-emerald-400 bg-clip-text text-transparent">
                                    Grow Together.
                                </span>
                                {/* Underline glow */}
                                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0" />
                            </span>
                        </h1>

                        {/* Typewriter line */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-xl font-semibold text-gray-400 sm:text-2xl">
                            <span className="text-blue-400">{typed}</span>
                            <span className="inline-block h-7 w-[2px] animate-[blink_.85s_step-end_infinite] rounded-full bg-blue-600 align-middle" />
                            <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
                        </div>

                        {/* Description */}
                        <p className="mx-auto mt-7 max-w-2xl text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
                            A transparent, member-governed community contribution platform registered in England & Wales.
                            Make voluntary donations, build your community network, and support one another.
                        </p>

                        {/* CTA row */}
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={route('register')}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-10 py-4 text-base font-black text-white shadow-[0_0_50px_rgba(37,99,235,.45)] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_70px_rgba(16,185,129,.35)]">
                                <span className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />
                                <span className="relative flex items-center gap-2.5">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    Start Donating Today
                                </span>
                            </Link>
                            <Link href={route('pages.how-it-works')}
                                className="group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white">
                                How It Works
                                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </div>

                        {/* Trust micro-row */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                            {[`Registered · ${company.registration}`, company.address, 'Public Ledger', 'KYC Compliant'].map((t, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700">
                                    <span className="h-1 w-1 rounded-full bg-blue-600/50" />{t}
                                </span>
                            ))}
                        </div>

                        {/* Glassmorphism stat pills */}
                        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { label: 'Members', value: (stats?.members ?? 0).toLocaleString(), icon: '👥' },
                                { label: 'Deposits', value: (stats?.deposits ?? 0).toLocaleString(), icon: '💎' },
                                { label: 'Paid Out', value: `$${(stats?.paid_out ?? 0).toFixed(0)}`, icon: '💰' },
                                { label: 'Countries', value: `${stats?.countries ?? 0}+`, icon: '🌍' },
                            ].map((s) => (
                                <div key={s.label}
                                    className="flex flex-col items-center gap-1 rounded-2xl border border-white/8 bg-white/5 px-4 py-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-600/20 hover:bg-blue-600/5">
                                    <span className="text-2xl">{s.icon}</span>
                                    <p className="text-xl font-black text-white tabular-nums">{s.value}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-gray-600">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-gray-700 pt-2">
                        <div className="h-2 w-1 animate-[scrollDot_1.5s_ease-in-out_infinite] rounded-full bg-blue-600" />
                        <style>{`@keyframes scrollDot { 0%,100%{transform:translateY(0);opacity:1} 50%{transform:translateY(6px);opacity:.3} }`}</style>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                TICKER MARQUEE
            ══════════════════════════════════════════ */}
            <Ticker items={TRUST_ITEMS} />

            {/* ══════════════════════════════════════════
                ANIMATED STATS BAR
            ══════════════════════════════════════════ */}
            <section className="bg-blue-950 py-20">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                        <Counter end={stats?.members ?? 0} suffix="+" label="Registered Members" sub="and growing daily" />
                        <Counter end={stats?.deposits ?? 0} suffix="+" label="Total Contributions" sub="publicly verifiable" />
                        <Counter end={Math.round((stats?.paid_out ?? 0))} prefix="$" label="Total Disbursed (USD)" sub="to community members" />
                        <Counter end={stats?.countries ?? 0} suffix="+" label="Countries Represented" sub="global community" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                HOW IT WORKS — horizontal stepper
            ══════════════════════════════════════════ */}
            <section className="bg-white py-28">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <FadeUp>
                        <div className="mb-20 text-center">
                            <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-5 py-1.5 text-[11px] font-black uppercase tracking-[.22em] text-emerald-700">
                                The Process
                            </span>
                            <h2 className="mt-5 text-5xl font-black tracking-tight text-gray-900">
                                How It Works
                            </h2>
                            <div className="mx-auto mt-4 h-[3px] w-16 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" />
                            <p className="mx-auto mt-5 max-w-xl text-base text-gray-500">
                                From sign-up to supporting — four simple steps to support your community.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="relative">
                        {/* Connector line */}
                        <div className="absolute left-0 right-0 top-10 hidden h-[2px] bg-gradient-to-r from-transparent via-blue-300/40 via-emerald-300/30 to-transparent lg:block" />

                        <div className="grid gap-8 lg:grid-cols-4">
                            {STEPS.map((s, i) => (
                                <FadeUp key={s.n} delay={i * 120}>
                                    <div className="group relative flex flex-col items-center text-center">
                                        {/* Step circle */}
                                        <div className="relative z-10 mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-900 shadow-xl shadow-gray-200/60 ring-4 ring-gray-100 transition-all duration-500 group-hover:bg-blue-600 group-hover:ring-blue-200">
                                            <span className="text-xl font-black text-blue-400 transition-colors duration-300 group-hover:text-gray-900">{s.n}</span>
                                        </div>
                                        <h3 className="mb-3 text-lg font-black text-gray-900">{s.title}</h3>
                                        <p className="text-sm font-medium leading-relaxed text-gray-500">{s.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>

                    <FadeUp delay={500}>
                        <div className="mt-16 text-center">
                            <Link href={route('register')}
                                className="group relative inline-flex overflow-hidden rounded-2xl bg-gray-900 px-10 py-4 text-sm font-black text-white transition-all duration-300 hover:bg-gray-800">
                                <span className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-blue-600/20 transition-transform duration-700 group-hover:translate-x-full" />
                                <span className="relative">Get Started Now →</span>
                            </Link>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                LIVE ACTIVITY FEED (if data available)
            ══════════════════════════════════════════ */}
            {latestDeposits.length > 0 && (
                <section className="relative overflow-hidden bg-blue-950 py-24">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.05),transparent_60%)]" />
                    <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-16 lg:grid-cols-2">
                            <FadeUp>
                                <div className="flex flex-col justify-center">
                                    <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.22em] text-blue-600">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                        </span>
                                        Live Activity
                                    </span>
                                    <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                                        Real-Time<br />
                                        <span className="text-blue-400">Public Ledger</span>
                                    </h2>
                                    <p className="mt-5 text-base text-gray-400">
                                        Every deposit made by members is permanently recorded and publicly visible. No hidden transactions — ever.
                                    </p>
                                    <Link href={route('public.deposits')}
                                        className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl border border-blue-600/30 bg-blue-600/10 px-6 py-3 text-sm font-black text-blue-400 transition-all duration-300 hover:border-blue-600/60 hover:bg-blue-600/15">
                                        View Full Ledger →
                                    </Link>
                                </div>
                            </FadeUp>

                            <FadeUp delay={150}>
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                    <div className="border-b border-white/10 px-6 py-4">
                                        <p className="text-xs font-black uppercase tracking-[.18em] text-gray-400">Latest Contributions</p>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {latestDeposits.slice(0, 7).map((d, i) => (
                                            <div key={d.reference} className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-sm">
                                                        💰
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-xs font-bold text-gray-300">{d.reference}</p>
                                                        <p className="text-[11px] text-gray-600">{d.created_at}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-black text-emerald-400">+${d.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════
                FEATURES GRID
            ══════════════════════════════════════════ */}
            <section className="bg-white py-28">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <FadeUp>
                        <div className="mb-20 text-center">
                            <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-5 py-1.5 text-[11px] font-black uppercase tracking-[.22em] text-blue-600">
                                Platform Features
                            </span>
                            <h2 className="mt-5 text-5xl font-black tracking-tight text-gray-900">
                                Everything You Need
                            </h2>
                            <div className="mx-auto mt-4 h-[3px] w-16 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" />
                            <p className="mx-auto mt-5 max-w-xl text-base text-gray-500">
                                Built on transparency, fairness, and community governance — designed for serious network marketers.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f, i) => (
                            <FadeUp key={f.title} delay={i * 70}>
                                <div className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-100">
                                    {/* Background gradient on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 transition-opacity duration-400 group-hover:opacity-[0.04]`} />

                                    <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} p-[1px]`}>
                                        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white transition-colors duration-300 group-hover:bg-transparent">
                                            <svg className="h-7 w-7 text-gray-700 transition-colors duration-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <h3 className="mb-2.5 text-base font-black text-gray-900">{f.title}</h3>
                                        <p className="text-sm font-medium leading-relaxed text-gray-500">{f.desc}</p>
                                    </div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                COMMISSION HIGHLIGHT
            ══════════════════════════════════════════ */}
            <section className="bg-blue-950 py-28">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-2">
                        <FadeUp>
                            <div>
                                <span className="inline-block rounded-full border border-blue-600/25 bg-blue-600/10 px-5 py-1.5 text-[11px] font-black uppercase tracking-[.22em] text-blue-600">
                                    Community Growth
                                </span>
                                <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                                    10-Level Deep<br />
                                    <span className="text-blue-400">Community Impact</span>
                                </h2>
                                <p className="mt-5 text-base text-gray-400">
                                    Every voluntary donation strengthens your 10-level community network.
                                    Together, members grow and support one another around the clock.
                                </p>
                                <ul className="mt-8 space-y-3">
                                    {['Direct referrals have the highest community impact', 'Donations recorded automatically in your account', 'Track every contribution in real-time from your dashboard', 'No cap on how large your network can grow'].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/15 text-blue-600 text-[10px]">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={route('register')}
                                    className="mt-10 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-[0_0_30px_rgba(37,99,235,.3)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_45px_rgba(37,99,235,.45)]">
                                    Start Donating →
                                </Link>
                            </div>
                        </FadeUp>

                        <FadeUp delay={150}>
                            <div className="flex items-center">
                                <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                    <div className="border-b border-white/10 px-6 py-4">
                                        <p className="text-xs font-black uppercase tracking-[.18em] text-gray-400">Community Level Overview</p>
                                    </div>
                                    <div className="divide-y divide-white/5 px-2">
                                        {[
                                            { gen: 'Generation 1', label: 'Direct Referral', rate: '10%', active: true },
                                            { gen: 'Generation 2', label: 'Level 2 Team', rate: '5%', active: false },
                                            { gen: 'Generation 3', label: 'Level 3 Team', rate: '3%', active: false },
                                            { gen: 'Generation 4–5', label: 'Mid-Level Team', rate: '2%', active: false },
                                            { gen: 'Generation 6–10', label: 'Deep Network', rate: '1%', active: false },
                                        ].map((row) => (
                                            <div key={row.gen}
                                                className={`flex items-center justify-between px-4 py-4 ${row.active ? 'bg-blue-600/10' : ''}`}>
                                                <div>
                                                    <p className={`text-sm font-black ${row.active ? 'text-blue-400' : 'text-gray-300'}`}>{row.gen}</p>
                                                    <p className="text-xs text-gray-600">{row.label}</p>
                                                </div>
                                                <span className={`rounded-lg px-3 py-1 text-sm font-black ${row.active ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                                                    {row.rate}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/10 bg-white/5 px-6 py-3">
                                        <p className="text-[11px] text-gray-700">*Actual rates configured by club admin. For illustration only.</p>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                FINAL CTA - MOTIVATIONAL / UNIQUE DESIGN
            ══════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-[#0a2e1a] py-20 sm:py-24 lg:py-28">
                {/* Unique background - deep green with gold/blue accents */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f4d2a] via-[#0a341c] to-[#071e12]"></div>
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c8a84e 1px, transparent 0)', backgroundSize: '28px 28px' }}></div>
                {/* Gold glow - top left */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#c8a84e]/12 blur-[80px]"></div>
                {/* Emerald glow - bottom right */}
                <div className="pointer-events-none absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[90px]"></div>
                {/* Blue glow - center */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/8 blur-[70px]"></div>
                {/* Decorative gold curve - top */}
                <div className="pointer-events-none absolute right-0 top-0 hidden h-[90px] w-[320px] overflow-hidden lg:block">
                    <div className="absolute right-[-20px] top-[-14px] h-[70px] w-[360px] rotate-[-2deg] rounded-bl-[32px] border-b border-[#c8a84e]/30 bg-white/[0.04]"></div>
                </div>

                <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:items-center">
                        {/* Left: Motivational Content */}
                        <FadeUp>
                            <div className="text-center lg:text-left">
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#c8a84e]/25 bg-[#c8a84e]/10 px-4 py-1.5 backdrop-blur-sm">
                                    <span className="flex h-2 w-2 rounded-full bg-[#c8a84e] animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c8a84e]">Together for a Better Tomorrow</span>
                                </span>

                                <h2 className="mt-6 text-[32px] font-black leading-[0.95] tracking-[-0.02em] text-white sm:text-[42px] lg:text-[48px]">
                                    Your Small
                                    <span className="relative inline-block">
                                        <span className="bg-gradient-to-r from-[#c8a84e] via-[#e6c878] to-[#c8a84e] bg-clip-text text-transparent"> Kindness</span>
                                    </span>
                                    <br />
                                    <span className="text-white">Creates Big</span>{' '}
                                    <span className="bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">Hope.</span>
                                </h2>

                                <p className="mx-auto mt-5 max-w-xl text-[15px] font-medium leading-relaxed text-white/70 lg:mx-0">
                                    In a world where you can be anything — <span className="font-bold text-white">be generous</span>. Your voluntary donation is not just an amount, it is <span className="font-semibold text-[#e6c878]">hope for a family, education for a child, strength for a community.</span> Join thousands of hearts beating as one.
                                </p>

                                {/* Motivational pillars */}
                                <div className="mx-auto mt-7 grid max-w-md grid-cols-3 gap-3 lg:mx-0">
                                    {[
                                        { icon: '♥', label: 'Give', sub: 'with Purpose' },
                                        { icon: '🤝', label: 'Grow', sub: 'with Community' },
                                        { icon: '✨', label: 'Glow', sub: 'with Gratitude' },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 backdrop-blur-sm text-center">
                                            <div className="text-[16px]">{item.icon}</div>
                                            <div className="mt-1 text-[12px] font-black leading-none text-white">{item.label}</div>
                                            <div className="text-[10px] font-semibold text-white/60">{item.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center">
                                    <Link
                                        href={route('register')}
                                        className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#c8a84e] to-[#b89a3e] px-7 py-3.5 text-[14px] font-black text-[#0a2e1a] shadow-[0_8px_24px_rgba(200,168,78,0.3)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(200,168,78,0.4)] hover:scale-[1.02] sm:w-auto"
                                    >
                                        <span className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-white/20 transition-transform duration-500 group-hover:translate-x-full"></span>
                                        <span className="relative flex items-center gap-2">Start Giving Today <span className="text-base">→</span></span>
                                    </Link>
                                    <Link
                                        href={route('public.deposits')}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-colors sm:w-auto"
                                    >
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        See Live Donations
                                    </Link>
                                </div>

                                <p className="mt-4 text-center text-xs font-semibold tracking-wide text-white/40 lg:text-left">
                                    No pressure · No promises · Just pure generosity · Be the reason someone believes in goodness
                                </p>
                            </div>
                        </FadeUp>

                        {/* Right: Unique Visual Card */}
                        <FadeUp delay={120}>
                            <div className="relative mx-auto w-full max-w-[420px] lg:ml-auto">
                                {/* Card stack effect */}
                                <div className="absolute -right-2 top-2 h-full w-full rounded-[24px] bg-[#c8a84e]/10 rotate-[1.5deg]"></div>
                                <div className="absolute -right-1 top-1 h-full w-full rounded-[24px] bg-white/[0.04] rotate-[0.7deg]"></div>

                                <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-2xl">
                                    {/* Card header - donation club branding */}
                                    <div className="bg-gradient-to-r from-[#0f4d2a] to-[#134e2d] px-5 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 border border-white/20 text-white text-sm">♥</div>
                                                <div>
                                                    <div className="text-xs font-black tracking-wide text-white">DONATIONCLUB</div>
                                                    <div className="text-[8px] font-bold tracking-[0.15em] text-[#c8a84e]">TOGETHER FOR A BETTER TOMORROW</div>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white border border-white/15">Live</span>
                                        </div>
                                    </div>

                                    {/* Impact preview */}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-400">Community Impact</p>
                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Live</span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-2.5">
                                            {[
                                                { k: '12k+', l: 'Donors' },
                                                { k: '$84k+', l: 'Shared' },
                                                { k: '1.4k', l: 'Lives Touched' },
                                            ].map((s) => (
                                                <div key={s.k} className="rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50/60 border border-blue-100/50 px-3 py-3 text-center">
                                                    <div className="text-[14px] font-black text-[#0f4d2a]">{s.k}</div>
                                                    <div className="text-[9px] font-bold uppercase tracking-wide text-gray-500">{s.l}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 space-y-2.5">
                                            {[
                                                { name: 'Aarav P.', amount: '$10.00', time: '2m ago', initial: 'A' },
                                                { name: 'Fatima K.', amount: '$5.00', time: '7m ago', initial: 'F' },
                                                { name: 'John D.', amount: '$8.00', time: '12m ago', initial: 'J' },
                                            ].map((d) => (
                                                <div key={d.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f4d2a] text-[10px] font-black text-white">{d.initial}</span>
                                                        <div>
                                                            <div className="text-xs font-bold text-gray-900 leading-none">{d.name}</div>
                                                            <div className="text-[10px] text-gray-500">{d.time} · Donated</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-emerald-600">+{d.amount}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 rounded-xl bg-[#0f4d2a] px-4 py-3 text-center">
                                            <p className="text-[11px] font-semibold leading-relaxed text-white/80">“I donated <span className="font-black text-[#c8a84e]">$5</span> — small for me, big for someone else. This feels like family.”</p>
                                            <p className="mt-1 text-[10px] font-bold text-white/50">— Real member, verified donation</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating badge */}
                                <div className="absolute -bottom-3 -left-3 rounded-xl bg-white px-3 py-2 shadow-xl border border-gray-100 hidden sm:flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">✓</span>
                                    <div>
                                        <div className="text-xs font-black leading-none text-gray-900">100% Transparent</div>
                                        <div className="text-[10px] font-medium text-gray-500">Public ledger verified</div>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}