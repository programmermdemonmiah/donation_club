import { Link, usePage } from '@inertiajs/react';
import Toaster from '@/components/common/Toaster';
import type { PageProps } from '@/types';

interface Props {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

const perks = [
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Verified public ledger' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Up to 10-generation referral network' },
    { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', label: 'Level-based community support' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Transparent fund distribution' },
];

export default function AuthLayout({ title, subtitle, children }: Props) {
    const { company } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen bg-white">
            {/* ── Left panel: Dark branded - blue to green gradient ── */}
            <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-emerald-900 p-12 lg:flex xl:p-16">
                {/* Grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                    }}
                />
                {/* Glow - blue + green */}
                <div className="pointer-events-none absolute -top-40 -left-20 h-[30rem] w-[30rem] rounded-full bg-blue-600/15 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-[26rem] w-[26rem] rounded-full bg-emerald-500/12 blur-[110px]" />

                {/* Logo */}
                <Link href="/" className="relative z-10 flex shrink-0 items-center">
                    {company.logo ? (
                        <img
                            src={company.logo}
                            alt={company.name}
                            className="h-auto max-h-[62px] w-[250px] object-cover"
                        />
                    ) : (
                        <div className="flex items-center gap-3 group">
                            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[2px] border-[#c8a84e] bg-[#0f4d2a] shadow-[0_0_20px_rgba(37,99,235,0.4)] overflow-hidden transition-shadow">
                                <span className="text-base">🤲</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[19px] font-black leading-none tracking-[0.02em] text-white">DONATIONCLUB</span>
                                <span className="mt-[1px] text-[7px] font-bold leading-none tracking-[0.2em] text-[#b89a3e]">TOGETHER FOR A BETTER TOMORROW</span>
                            </div>
                        </div>
                    )}
                </Link>

                {/* Body */}
                <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Global Community Network</p>
                    <h2 className="mt-4 text-4xl font-black leading-tight text-white xl:text-5xl">
                        Grow together.<br />
                        <span className="bg-gradient-to-r from-blue-300 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                            Donate together.
                        </span>
                    </h2>
                    <p className="mt-5 text-base font-medium leading-relaxed text-blue-100/70">
                        Join a transparent, member-governed contribution platform trusted by thousands of members worldwide.
                    </p>

                    <ul className="mt-10 space-y-4">
                        {perks.map((perk, idx) => (
                            <li key={perk.label} className="flex items-center gap-4">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${idx % 2 === 0 ? 'bg-blue-500/15 ring-blue-500/25' : 'bg-emerald-500/15 ring-emerald-500/25'}`}>
                                    <svg className={`h-5 w-5 ${idx % 2 === 0 ? 'text-blue-400' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={perk.icon} />
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold text-gray-200">{perk.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs font-medium text-gray-600">
                    © {new Date().getFullYear()} {company.name} · Reg. {company.registration}
                </p>
            </div>

            {/* ── Right panel: White form ── */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
                {/* Mobile logo */}
                <Link href="/" className="mb-10 flex shrink-0 items-center lg:hidden">
                    {company.logo ? (
                        <img
                            src={company.logo}
                            alt={company.name}
                            className="h-auto max-h-[58px] w-[220px] object-cover"
                        />
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[2px] border-[#c8a84e] bg-[#0f4d2a] shadow-sm overflow-hidden">
                                <span className="text-base">🤲</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[19px] font-black leading-none tracking-[0.02em] text-[#0f3d2b]">DONATIONCLUB</span>
                                <span className="mt-[1px] text-[7px] font-bold leading-none tracking-[0.2em] text-[#b89a3e]">TOGETHER FOR A BETTER TOMORROW</span>
                            </div>
                        </div>
                    )}
                </Link>

                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">{title}</h1>
                        {subtitle && <p className="mt-2 text-base font-medium text-gray-500">{subtitle}</p>}
                    </div>

                    <div>{children}</div>
                </div>
            </div>

            <Toaster />
        </div>
    );
}
