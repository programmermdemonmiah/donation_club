import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function About() {
    const { company } = usePage<PageProps>().props;

    return (
        <PublicLayout>
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/40 ring-1 ring-gray-100">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-16 text-center sm:px-16">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                            About {company.name}
                        </h1>
                        <p className="mt-4 text-lg font-medium text-indigo-100">
                            Learn more about our vision, our legal entity, and how our community contribution platform operates.
                        </p>
                    </div>
                    
                    <div className="px-8 py-12 sm:px-16 sm:py-16">
                        <div className="prose prose-lg prose-indigo mx-auto text-gray-600">
                            <p className="lead text-xl leading-relaxed text-gray-800">
                                {company.name} is a community contribution platform. Members make small voluntary contributions to a shared fund and may build teams through personal referrals.
                            </p>
                            
                            <div className="my-10 rounded-2xl border-l-4 border-indigo-500 bg-indigo-50 p-6 shadow-sm">
                                <p className="m-0 text-base text-indigo-900">
                                    The platform is operated by <strong className="font-bold text-indigo-950">{company.name}</strong>, a legal entity registered under registration number <strong className="font-bold text-indigo-950">{company.registration}</strong>. 
                                    Our registered office is located at <strong className="font-bold text-indigo-950">{company.address}</strong>.
                                </p>
                            </div>
                            
                            <p className="text-base leading-relaxed">
                                Contributions are voluntary donations — they are not investments, deposits with guaranteed yield, or securities. All business rules — contribution limits, referral commission percentages, rank requirements, support fund eligibility — are configurable by administrators and published openly on this site.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
