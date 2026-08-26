import PublicLayout from '@/layouts/PublicLayout';

export default function RiskDisclosure() {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900">Risk & Disclosure Statement</h1>
                <div className="mt-6 space-y-4 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm leading-relaxed text-rose-900">
                    <p><strong>Total loss risk.</strong> Contributions are voluntary donations. You may lose your entire contribution. Never contribute money you cannot afford to lose.</p>
                    <p><strong>No guarantees.</strong> The platform does not promise any return, profit, interest, or fixed payout date. Any reward described anywhere on this site is discretionary and conditional on admin approval and configured rules.</p>
                    <p><strong>Referral programs.</strong> Multi-generation commissions may be restricted or prohibited under the law of some jurisdictions. Participation is your responsibility; check local regulations.</p>
                    <p><strong>Honest operation.</strong> This platform commits to accurately representing its real legal entity and operating country at all times, and never to fabricate company registrations or addresses.</p>
                </div>
            </div>
        </PublicLayout>
    );
}
