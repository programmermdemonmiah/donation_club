import PublicLayout from '@/layouts/PublicLayout';

const sections = [
    {
        title: 'What data we collect.',
        body: 'We collect only the data required to operate member accounts: name, email address, optional profile details, referral relationships and financial ledger records.',
        icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
    },
    {
        title: 'What is public.',
        body: 'Only deposit sequence numbers, amounts and timestamps. Member identities, emails, wallets and payment credentials are never public.',
        icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    },
    {
        title: 'Security.',
        body: 'Passwords are hashed, sessions are encrypted, all financial operations are logged in an immutable audit trail.',
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    {
        title: 'Your rights.',
        body: 'You may request export or correction of your personal data at any time via support. Financial ledger records are retained for legal compliance.',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
];

export default function Privacy() {
    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-blue-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950"></div>
                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">Legal</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Privacy Policy</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed text-gray-400">
                        We take your privacy seriously. Here's exactly what we collect and how we protect it.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {sections.map((section, i) => (
                            <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.icon} />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-black text-gray-900">{section.title}</h2>
                                <p className="mt-3 text-base font-medium leading-relaxed text-gray-600">{section.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
