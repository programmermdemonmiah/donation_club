import PublicLayout from '@/layouts/PublicLayout';

const faqs = [
    { q: 'Are my contributions an investment?', a: 'No. Contributions are voluntary donations to a community fund. There is no guaranteed return and no fixed payout date.' },
    { q: 'What is the minimum/maximum deposit?', a: 'Currently between $1 and $10 per deposit. Exact limits are shown on the deposit page and controlled by administrators.' },
    { q: 'How do referral commissions work?', a: 'When enabled, direct referrals earn a percentage-based commission on qualifying events, and upline members across up to 10 generations earn smaller generation commissions. All rates are configured by admins and visible in your dashboard.' },
    { q: 'When will I receive a return?', a: 'There is no fixed return date. Returns are discretionary, require eligibility, and must be approved by administrators.' },
    { q: 'How do I withdraw?', a: 'Wallet balances can be withdrawn once they meet minimum limits. Requests are locked while pending and processed by administrators.' },
];

export default function Faq() {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                <div className="mt-8 space-y-4">
                    {faqs.map((faq) => (
                        <details key={faq.q} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-900">{faq.q}</summary>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}
