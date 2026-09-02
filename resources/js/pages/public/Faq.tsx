import PublicLayout from '@/layouts/PublicLayout';
import { useState } from 'react';

const faqs = [
    { q: 'Are my contributions an investment?', a: 'No. Contributions are voluntary donations to a community fund. There is no guaranteed return and no fixed payout date.' },
    { q: 'What is the minimum/maximum deposit?', a: 'Currently between $1 and $10 per deposit. Exact limits are shown on the deposit page and controlled by administrators.' },
    { q: 'How do referral donations work?', a: 'When enabled, direct referrals generate a donation share on qualifying contributions, and community members across up to 10 levels share smaller level-based contributions. All rates are configured by admins and visible in your dashboard.' },
    { q: 'When will I receive community support?', a: 'Community support distributions are voluntary, require eligibility, and must be approved by administrators.' },
    { q: 'How do I withdraw?', a: 'Wallet balances can be withdrawn once they meet minimum limits. Requests are locked while pending and processed by administrators.' },
];

export default function Faq() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-blue-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950"></div>
                <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">Knowledge Base</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Frequently Asked Questions</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400">
                        Everything you need to know about the platform. Can't find an answer? Contact us.
                    </p>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
                        {faqs.map((faq, i) => (
                            <div key={i}>
                                <button
                                    className="flex w-full items-center justify-between px-8 py-6 text-left transition-colors hover:bg-gray-50"
                                    onClick={() => setOpen(open === i ? null : i)}
                                >
                                    <span className="text-base font-bold text-gray-900">{faq.q}</span>
                                    <span className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${open === i ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                                        <svg className={`h-4 w-4 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </span>
                                </button>
                                {open === i && (
                                    <div className="border-t border-blue-100 bg-blue-50/30 px-8 py-6">
                                        <p className="text-base font-medium leading-relaxed text-gray-600">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
