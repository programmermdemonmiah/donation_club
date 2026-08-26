import PublicLayout from '@/layouts/PublicLayout';
import Button from '@/components/ui/Button';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Home() {
    const page = usePage<PageProps & { stats: { total_deposits: number; total_amount: string; members: number }; depositRules: { min: string; max: string } }>();

    return (
        <PublicLayout>
            <section className="text-center">
                <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                    A community contribution club
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                    Members make small voluntary contributions, build teams through referrals, and may qualify for community rewards and support funds.
                    Every completed contribution is recorded in a public, sequential ledger.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                    <Link href={route('register')} className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        Join the Club
                    </Link>
                    <Link href={route('pages.how-it-works')} className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                        How It Works
                    </Link>
                </div>
            </section>

            <section className="mt-16 grid gap-5 sm:grid-cols-3">
                <Stat label="Completed contributions" value={String(page.props.stats.total_deposits)} />
                <Stat label="Community total" value={`$${Number(page.props.stats.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                <Stat label="Members" value={String(page.props.stats.members)} />
            </section>

            <section className="mt-16 grid gap-5 md:grid-cols-3">
                <Feature title="Small, accessible amounts" body={`Contribute between $${page.props.depositRules.min} and $${page.props.depositRules.max} per deposit. Fair and equal for every member.`} />
                <Feature title="Transparent sequence ledger" body="Every confirmed deposit gets a permanent public sequence number. No hidden books." />
                <Feature title="Referral rewards & ranks" body="Grow your team across up to 10 generations. Ranks unlock eligibility for community support funds." />
            </section>

            <section className="mt-16 rounded-xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-amber-800">Important disclosure</h2>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">
                    Contributions are voluntary donations to the community fund — not investments. Any return, reward or commission is
                    discretionary, never guaranteed, and only paid when configured and approved by administrators. See our{' '}
                    <Link href={route('pages.risk-disclosure')} className="font-semibold underline">Risk / Disclosure</Link> page before joining.
                </p>
            </section>
        </PublicLayout>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{value}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
        </div>
    );
}

function Feature({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
        </div>
    );
}
