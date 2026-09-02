import { Link } from '@inertiajs/react';

interface Props {
    currentPage: number;
    lastPage: number;
    perPage?: number;
}

function pageUrl(currentPage: number): string | undefined {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(currentPage));
    return `${window.location.pathname}?${params.toString()}`;
}

export default function Pagination({ currentPage, lastPage }: Props) {
    if (lastPage <= 1) return null;

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(lastPage, currentPage + 2);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 px-5 py-3" aria-label="Pagination">
            <span className="text-xs text-gray-500">
                Page {currentPage} of {lastPage}
            </span>
            <div className="flex gap-1">
                {currentPage > 1 && (
                    <Link href={pageUrl(currentPage - 1)!} preserveScroll className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
                        Previous
                    </Link>
                )}
                {pages.map((page) => (
                    <Link
                        key={page}
                        href={pageUrl(page)!}
                        preserveScroll
                        className={
                            page === currentPage
                                ? 'rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white'
                                : 'rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100'
                        }
                    >
                        {page}
                    </Link>
                ))}
                {currentPage < lastPage && (
                    <Link href={pageUrl(currentPage + 1)!} preserveScroll className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
                        Next
                    </Link>
                )}
            </div>
        </nav>
    );
}
