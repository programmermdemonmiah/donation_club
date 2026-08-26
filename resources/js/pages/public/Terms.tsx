import PublicLayout from '@/layouts/PublicLayout';

export default function Terms() {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <div className="prose prose-sm mt-6 max-w-none text-gray-600">
                    <p><strong>1. Nature of contributions.</strong> All amounts you send to the club are voluntary donations to a community fund. They are not investments, loans, deposits, or securities, and they carry no guarantee of return of principal.</p>
                    <p className="mt-4"><strong>2. Eligibility.</strong> You must be legally permitted to participate in such community programs in your jurisdiction. It is your responsibility to confirm local legality.</p>
                    <p className="mt-4"><strong>3. Rewards.</strong> Commissions, returns and fund disbursements are discretionary benefits governed by configurable platform rules and require administrative approval. No payout date is promised.</p>
                    <p className="mt-4"><strong>4. Accounts.</strong> One account per person. Circumventing limits, fraudulent payments or abuse of the referral system results in permanent suspension without refund.</p>
                    <p className="mt-4"><strong>5. Operator.</strong> This service is operated by the legal entity actually running this website, in its actual jurisdiction. Contact details published here identify that entity.</p>
                </div>
            </div>
        </PublicLayout>
    );
}
