import AppLayout from '@/layouts/AppLayout';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDate, formatMoney, formatSequence } from '@/utils/format';

interface DepositRow {
    id: number;
    reference: string;
    amount: string;
    status: string;
    sequence_number: number | null;
    created_at: string;
}

export default function Deposits() {
    const page = usePage<
        PageProps & {
            deposits: { data: DepositRow[]; current_page: number; last_page: number };
            eligibility: boolean;
            eligibilityReason?: string;
            rules: { min: string; max: string };
        }
    >();
    const { deposits, eligibility, eligibilityReason, rules } = page.props;

    const form = useForm({ amount: rules.min });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('deposits.store'));
    };

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Deposits</h1>
            <p className="mt-1 text-sm text-gray-500">
                Voluntary contributions between <strong>${rules.min}</strong> and <strong>${rules.max}</strong>.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* New deposit */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">New Deposit</h2>
                    {eligibility ? (
                        <form onSubmit={submit} className="mt-4 space-y-4">
                            <Input
                                label={`Amount (USD, ${rules.min}–${rules.max})`}
                                type="number"
                                step="0.01"
                                min={rules.min}
                                max={rules.max}
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                error={form.errors.amount}
                                required
                            />
                            <Button type="submit" loading={form.processing} className="w-full">
                                Continue to payment
                            </Button>
                        </form>
                    ) : (
                        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
                            {eligibilityReason ?? 'Deposits are currently unavailable for your account.'}
                        </div>
                    )}
                </div>

                {/* History */}
                <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Deposit History</h2>
                    </div>
                    <Table<DepositRow>
                        columns={[
                            { header: 'Sequence', render: (d) => <span className="font-mono font-semibold text-indigo-600">{formatSequence(d.sequence_number)}</span> },
                            { header: 'Reference', render: (d) => <Link href={route('deposits.show', d.id)} className="font-mono text-xs text-gray-700 hover:text-indigo-600">{d.reference}</Link> },
                            { header: 'Amount', render: (d) => formatMoney(d.amount) },
                            { header: 'Status', render: (d) => <Badge value={d.status} /> },
                            { header: 'Created', render: (d) => formatDate(d.created_at) },
                        ]}
                        rows={deposits.data}
                        rowKey={(d) => d.id}
                        emptyMessage="No deposits yet."
                    />
                    <Pagination currentPage={deposits.current_page} lastPage={deposits.last_page} />
                </div>
            </div>
        </AppLayout>
    );
}
