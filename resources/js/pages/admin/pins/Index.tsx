import AdminLayout from '@/layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Pin {
    id: number;
    pin_code: string;
    is_used: boolean;
    used_by: {
        id: number;
        username: string;
    } | null;
    created_at: string;
}

interface Props {
    pins: {
        data: Pin[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function PinsIndex({ pins }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        quantity: 1,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.pins.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout>
            <Head title="Generate PIN" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Secret Pins</h1>
                    <p className="text-sm text-gray-500">Generate and manage 6-digit secret pins for member registration.</p>
                </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                    <h2 className="text-lg font-semibold text-gray-900">Generate New Pins</h2>
                </div>
                <div className="px-6 py-6">
                    <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
                        <div className="flex-1 sm:max-w-xs">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                Number of Pins to Generate
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    max="500"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                                    className="block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                        </div>
                        <div className="sm:mt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? 'Generating...' : 'Generate PINs'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Pin Code
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Used By
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Generated On
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {pins.data.map((pin) => (
                                <tr key={pin.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        <span className="rounded-md bg-gray-100 px-2 py-1 font-mono tracking-widest">{pin.pin_code}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                                        {pin.is_used ? (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                Used
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                Unused
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                                        {pin.is_used && pin.used_by ? (
                                            <span className="font-medium text-gray-900">{pin.used_by.username}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                                        {new Date(pin.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </td>
                                </tr>
                            ))}
                            {pins.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No pins generated yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pins.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => router.get(pins.links[0].url || '')}
                                disabled={!pins.links[0].url}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => router.get(pins.links[pins.links.length - 1].url || '')}
                                disabled={!pins.links[pins.links.length - 1].url}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{pins.current_page}</span> of{' '}
                                    <span className="font-medium">{pins.last_page}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    {pins.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium focus:z-20 ${
                                                link.active
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            } ${i === 0 ? 'rounded-l-md' : ''} ${i === pins.links.length - 1 ? 'rounded-r-md' : ''} border disabled:opacity-50`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
