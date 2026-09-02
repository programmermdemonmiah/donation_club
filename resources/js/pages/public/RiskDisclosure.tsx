import PublicLayout from '@/layouts/PublicLayout';

const risks = [
    {
        title: 'Total loss risk.',
        body: 'Contributions are voluntary donations. You may lose your entire contribution. Never contribute money you cannot afford to lose.',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
        title: 'No guarantees.',
        body: 'The platform does not promise any return or profit. Any community support described is voluntary and conditional on admin approval and configured rules.',
        icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Referral programs.',
        body: 'Multi-level community support may be restricted or prohibited under the law of some jurisdictions. Participation is your responsibility; check local regulations.',
        icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
    },
    {
        title: 'Honest operation.',
        body: 'This platform commits to accurately representing its real legal entity and operating country at all times, and never to fabricate company registrations or addresses.',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
];

export default function RiskDisclosure() {
    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-blue-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950"></div>
                <div className="pointer-events-none absolute -top-40 right-1/3 h-96 w-96 rounded-full bg-red-500/8 blur-[120px]"></div>
                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-red-400">Legal</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Risk & Disclosure Statement</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-red-400 to-blue-600"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400">
                        Please read this carefully before participating. Your understanding of the risks involved is essential.
                    </p>
                </div>
            </section>

            {/* Risk Cards */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {risks.map((risk, i) => (
                            <div key={i} className="rounded-2xl border border-red-100 bg-red-50/50 p-8">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={risk.icon} />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-black text-gray-900">{risk.title}</h2>
                                <p className="mt-3 text-base font-medium leading-relaxed text-gray-600">{risk.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
