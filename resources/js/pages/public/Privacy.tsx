import PublicLayout from '@/layouts/PublicLayout';

export default function Privacy() {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <div className="prose prose-sm mt-6 max-w-none text-gray-600">
                    <p>We collect only the data required to operate member accounts: name, email address, optional profile details, referral relationships and financial ledger records.</p>
                    <p className="mt-4"><strong>What is public:</strong> only deposit sequence numbers, amounts and timestamps. Member identities, emails, wallets and payment credentials are never public.</p>
                    <p className="mt-4"><strong>Security:</strong> passwords are hashed, sessions are encrypted, all financial operations are logged in an immutable audit trail.</p>
                    <p className="mt-4"><strong>Your rights:</strong> you may request export or correction of your personal data at any time via support. Financial ledger records are retained for legal compliance.</p>
                </div>
            </div>
        </PublicLayout>
    );
}
