import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function About() {
    const { company } = usePage<PageProps>().props;

    return (
        <PublicLayout>
            {/* Page Hero */}
            <section className="relative overflow-hidden bg-blue-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950"></div>
                <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>

                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">Who We Are</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">
                        About {company.name}
                    </h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400">
                        Learn more about our vision, our legal entity, and how our community contribution platform operates.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
                        {/* Left: Main Text */}
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest text-blue-600">Our Mission</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                                A Community Built on Trust & Transparency
                            </h2>
                            <div className="mt-5 h-1 w-16 rounded bg-blue-600"></div>
                            <p className="mt-8 text-lg font-medium leading-relaxed text-gray-600">
                                {company.name} is a community contribution platform. Members make small voluntary contributions to a shared fund and may build teams through personal referrals.
                            </p>
                            <p className="mt-6 text-base font-medium leading-relaxed text-gray-600">
                                Contributions are voluntary donations — they are not investments or securities. All community rules — donation limits, referral donation percentages, community level requirements, support fund eligibility — are configurable by administrators and published openly on this site.
                            </p>
                        </div>

                        {/* Right: Info Cards */}
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
                                <p className="text-xs font-black uppercase tracking-widest text-blue-600">Legal Entity</p>
                                <h3 className="mt-3 text-2xl font-black text-gray-900">{company.name}</h3>
                                <p className="mt-3 text-base font-medium text-gray-600">
                                    Registered and operating as a legal entity under registration number{' '}
                                    <strong className="font-black text-gray-900">{company.registration}</strong>.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
                                <p className="text-xs font-black uppercase tracking-widest text-blue-600">Registered Office</p>
                                <p className="mt-3 text-xl font-bold text-gray-900">{company.address}</p>
                            </div>

                            <div className="rounded-2xl border border-blue-200/50 bg-blue-50 p-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold leading-relaxed text-blue-900">
                                        Contributions are voluntary donations and are not investments, deposits, or securities of any kind. Past participation does not guarantee future results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
