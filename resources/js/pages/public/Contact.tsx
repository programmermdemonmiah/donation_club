import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Contact() {
    const { company } = usePage<PageProps>().props;

    const contacts = [
        {
            label: 'Email',
            value: company.email,
            href: `mailto:${company.email}`,
            icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
            isLink: true,
        },
        {
            label: 'Phone',
            value: company.phone,
            href: `tel:${company.phone}`,
            icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
            isLink: true,
        },
        {
            label: 'Registered Address',
            value: company.address,
            href: null,
            icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
            isLink: false,
        },
    ];

    return (
        <PublicLayout>
            {/* Page Hero */}
            <section className="relative overflow-hidden bg-gray-950 py-24 sm:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"></div>
                <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]"></div>

                <div className="relative z-10 mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-500">Get In Touch</p>
                    <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">Contact Us</h1>
                    <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-400">
                        We're here to help. Reach out through our official channels below.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    {/* Warning */}
                    <div className="mx-auto mb-16 max-w-3xl rounded-2xl border border-amber-200/50 bg-amber-50 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold leading-relaxed text-amber-900">
                                For questions about your account, contributions or withdrawals, contact the club operator through the official support channels below.{' '}
                                <strong>Always verify you are communicating with the real operating entity before sharing any information.</strong>
                            </p>
                        </div>
                    </div>

                    {/* Contact Cards */}
                    <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {contacts.map((item) => (
                            <div key={item.label} className="group rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:bg-white hover:shadow-xl hover:shadow-amber-100/50">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 group-hover:border-amber-300 group-hover:bg-amber-50">
                                    <svg className="h-7 w-7 text-gray-500 transition-colors duration-300 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                                {item.isLink ? (
                                    <a href={item.href!} className="mt-2 block text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors">
                                        {item.value}
                                    </a>
                                ) : (
                                    <p className="mt-2 text-lg font-bold text-gray-900">{item.value}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
