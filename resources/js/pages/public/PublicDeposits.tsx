import PublicLayout from '@/layouts/PublicLayout';
import Pagination from '@/components/ui/Pagination';
import { usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/format';

interface DepositRow {
    sequence_number: number;
    formatted: string;
    amount: string;
    completed_at: string | null;
}

export default function PublicDeposits() {
    const page = usePage<{ deposits: { data: DepositRow[]; current_page: number; last_page: number } }>();
    const { data, current_page, last_page } = page.props.deposits;

    return (
        <PublicLayout>
            <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-bold text-gray-900">Public Deposit Ledger</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Every confirmed community contribution, in permanent sequence order. Only amounts and sequence numbers are public — never personal data.
                </p>

                <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {data.length === 0 && (
                            <p className="px-5 py-12 text-center text-sm text-gray-500">No completed deposits yet. The ledger will update as members confirm contributions.</p>
                        )}
                        {data.map((deposit) => (
                            <div key={deposit.sequence_number} className="flex items-center justify-between px-5 py-4">
                                <div>
                                    <span className="font-mono text-sm font-semibold text-indigo-600">{deposit.formatted}</span>
                                    <p className="text-xs text-gray-400">Deposit #{String(deposit.sequence_number).padStart(6, '0')}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-base font-bold text-gray-900">${Number(deposit.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    <p className="text-xs text-gray-400">{formatDate(deposit.completed_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination currentPage={current_page} lastPage={last_page} />
                </div>
            </div>
        </PublicLayout>
    );
}
