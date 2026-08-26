import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Contact() {
    const { company } = usePage<PageProps>().props;

    return (
        <PublicLayout>
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/40 ring-1 ring-gray-100">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-16 text-center sm:px-16">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                            Contact Us
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-indigo-100">
                            We're here to help. Reach out through our official channels below.
                        </p>
                    </div>

                    <div className="px-8 py-12 sm:px-16 sm:py-16">
                        <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                            <p className="text-base leading-relaxed text-amber-900">
                                For questions about your account, contributions or withdrawals, contact the club operator through the official
                                support channels below. <span className="font-bold">Always verify you are communicating with the real operating entity before sharing any information.</span>
                            </p>
                        </div>
                        
                        <div className="grid gap-8 sm:grid-cols-2">
                            {/* Email Card */}
                            <div className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-transform duration-300 group-hover:rotate-6">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Email</h3>
                                <a href={`mailto:${company.email}`} className="mt-2 block text-lg font-bold text-indigo-600 hover:text-indigo-500">{company.email}</a>
                            </div>

                            {/* Phone Card */}
                            <div className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-transform duration-300 group-hover:-rotate-6">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Phone</h3>
                                <a href={`tel:${company.phone}`} className="mt-2 block text-lg font-bold text-indigo-600 hover:text-indigo-500">{company.phone}</a>
                            </div>

                            {/* Address Card (Spans full width on small screens) */}
                            <div className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50 sm:col-span-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-transform duration-300 group-hover:scale-110">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Registered Address</h3>
                                <p className="mt-2 text-lg font-medium text-gray-900">{company.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
