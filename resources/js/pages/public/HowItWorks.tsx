import PublicLayout from '@/layouts/PublicLayout';

export default function HowItWorks() {
    const steps = [
        { title: '1. Register', body: 'Create a free account with your email. Optionally use a friend\'s referral code to join their team.' },
        { title: '2. Contribute', body: 'Make a voluntary contribution between $1 and $10. Each confirmed deposit receives a permanent public sequence number.' },
        { title: '3. Build your team', body: 'Share your referral link. Your team can extend up to 10 generations below you.' },
        { title: '4. Qualify', body: 'Meet configurable requirements (direct referrals, rank, deposit totals) to become eligible for discretionary rewards.' },
        { title: '5. Rewards & funds', body: 'Approved rewards are paid into your wallet. Qualified ranks can request employment support funds.' },
        { title: '6. Withdraw', body: 'Request withdrawals of your available wallet balance. Requests are reviewed and paid out by administrators.' },
    ];

    return (
        <PublicLayout>
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900">How It Works</h1>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    {steps.map((step) => (
                        <div key={step.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-indigo-600">{step.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.body}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                    Rewards, commissions and returns are never guaranteed and depend on administrator approval and configured rules.
                </div>
            </div>
        </PublicLayout>
    );
}
