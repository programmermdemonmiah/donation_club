import PublicLayout from '@/layouts/PublicLayout';

export default function Contact() {
    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-600">
                        For questions about your account, contributions or withdrawals, contact the club operator through the official
                        support email listed in the Terms page of this website. Always verify you are communicating with the real
                        operating entity before sharing any information.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
