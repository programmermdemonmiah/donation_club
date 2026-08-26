import { cn } from '@/utils/format';

interface Column<T> {
    header: string;
    render: (row: T) => React.ReactNode;
    className?: string;
}

interface Props<T> {
    columns: Array<Column<T>>;
    rows: T[];
    rowKey: (row: T) => string | number;
    emptyMessage?: string;
}

export default function Table<T>({ columns, rows, rowKey, emptyMessage = 'No records found.' }: Props<T>) {
    if (rows.length === 0) {
        return (
            <div className="px-5 py-12 text-center">
                <p className="text-sm text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} scope="col" className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500', col.className)}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row) => (
                        <tr key={rowKey(row)} className="hover:bg-gray-50/70">
                            {columns.map((col, i) => (
                                <td key={i} className={cn('px-4 py-3 text-sm text-gray-700 whitespace-nowrap', col.className)}>
                                    {col.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
