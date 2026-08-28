import PublicLayout from '@/layouts/PublicLayout';

const steps = [
    {
        number: '01',
        title: 'Register',
        body: "Create a free account with your email. Optionally use a friend's referral code to join their team.",
        icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    },
    {
        number: '02',
        title: 'Contribute',
        body: 'Make a voluntary contribution between $1 and $10. Each confirmed deposit receives a permanent public sequence number.',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        number: '03',
        title: 'Build Your Team',
        body: 'Share your referral link. Your team can extend up to 10 generations below you.',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
        number: '04',
        title: 'Qualify',
        body: 'Meet configurable requirements (direct referrals, rank, deposit totals) to become eligible for discretionary rewards.',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    },
    {
        number: '05',
        title: 'Rewards & Funds',
        body: 'Approved rewards are paid into your wallet. Qualified ranks can request employment support funds.',
        icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    },
    {
        number: '06',
        title: 'Withdraw',
        body: 'Request withdrawals of your available wallet balance. Requests are reviewed and paid out by administrators.',
        icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
    },
];

export default function HowItWorks() {
    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gray-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"></div>
                <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]"></div>
                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-500">Step by Step</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">How It Works</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400">
                        Six simple steps to participate, grow your network, and qualify for community rewards.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {steps.map((step, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg shadow-gray-200/40 transition-all duration-300 hover:-translate-y-2 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/50">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 transition-all duration-300 group-hover:border-amber-300 group-hover:bg-amber-50">
                                        <svg className="h-7 w-7 text-gray-500 transition-colors duration-300 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-4xl font-black text-gray-100 transition-colors duration-300 group-hover:text-amber-100">{step.number}</span>
                                </div>
                                <h2 className="text-xl font-black text-gray-900">{step.title}</h2>
                                <p className="mt-3 text-base font-medium leading-relaxed text-gray-600">{step.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-16 rounded-2xl border border-amber-200/50 bg-amber-50 p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-base font-semibold leading-relaxed text-amber-900">
                                Rewards, commissions and returns are never guaranteed and depend on administrator approval and configured rules.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
