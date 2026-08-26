import PublicLayout from '@/layouts/PublicLayout';

export default function About() {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900">About the Club</h1>
                <div className="prose prose-sm mt-6 max-w-none text-gray-600">
                    <p>Donation Club is a community contribution platform. Members make small voluntary contributions to a shared fund and may build teams through personal referrals.</p>
                    <p className="mt-4">The platform is operated by the legal entity registered for this domain in its actual operating jurisdiction. We do not misrepresent our location, registration, or regulatory status. Contributions are voluntary donations — they are not investments, deposits with guaranteed yield, or securities.</p>
                    <p className="mt-4">All business rules — contribution limits, referral commission percentages, rank requirements, support fund eligibility — are configurable by administrators and published openly on this site.</p>
                </div>
            </div>
        </PublicLayout>
    );
}
