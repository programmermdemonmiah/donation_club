import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatMoney } from '@/utils/format';
import { FormEvent } from 'react';
import Alert from '@/components/ui/Alert';

export default function Transfer() {
    const { balance, is_agent } = usePage<PageProps & { balance: string; is_agent: boolean }>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        identifier: '',
        amount: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('transfer.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Transfer Balance
                </h2>
            }
        >
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader 
                        title="Send Money" 
                        subtitle="Transfer funds from your wallet to another member's wallet."
                    />
                    <CardBody>
                        <div className="mb-6 rounded-xl bg-blue-50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Available Balance</p>
                                    <p className="mt-1 text-2xl font-bold text-blue-700">{formatMoney(balance)}</p>
                                </div>
                                {is_agent && (
                                    <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-1 text-sm font-medium text-purple-800">
                                        Agent Mode
                                    </span>
                                )}
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                    Recipient Username or Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="identifier"
                                        type="text"
                                        required
                                        value={data.identifier}
                                        onChange={(e) => setData('identifier', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="user@example.com or username"
                                    />
                                    {errors.identifier && (
                                        <p className="mt-2 text-sm text-red-600">{errors.identifier}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                    Amount (USD)
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        required
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? 'Processing...' : 'Send Funds'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
