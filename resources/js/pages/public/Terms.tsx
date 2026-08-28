import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

const clauses = [
    { number: '1', title: 'Nature of contributions.', body: '' }, // filled dynamically
    { number: '2', title: 'Eligibility.', body: 'You must be legally permitted to participate in such community programs in your jurisdiction. It is your responsibility to confirm local legality.' },
    { number: '3', title: 'Rewards.', body: 'Commissions, returns and fund disbursements are discretionary benefits governed by configurable platform rules and require administrative approval. No payout date is promised.' },
    { number: '4', title: 'Accounts.', body: 'One account per person. Circumventing limits, fraudulent payments or abuse of the referral system results in permanent suspension without refund.' },
];

export default function Terms() {
    const { company } = usePage<PageProps>().props;

    const allClauses = [
        { number: '1', title: 'Nature of contributions.', body: `All amounts you send to ${company.name} are voluntary donations to a community fund. They are not investments, loans, deposits, or securities, and they carry no guarantee of return of principal.` },
        ...clauses.slice(1),
        { number: '5', title: 'Operator.', body: `This service is operated by ${company.name} (Registration No: ${company.registration}). Address: ${company.address}. For questions, email us at: ${company.email}.` },
    ];

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gray-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"></div>
                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-500">Legal</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Terms of Service</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                </div>
            </section>

            {/* Content */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
                        {allClauses.map((clause) => (
                            <div key={clause.number} className="p-8">
                                <div className="flex items-start gap-5">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-black text-amber-600 ring-1 ring-amber-200">
                                        {clause.number}
                                    </span>
                                    <div>
                                        <h2 className="text-base font-black text-gray-900">{clause.title}</h2>
                                        <p className="mt-2 text-base font-medium leading-relaxed text-gray-600">{clause.body}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
