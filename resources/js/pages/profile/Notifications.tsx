import AppLayout from '@/layouts/AppLayout';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTime } from '@/utils/format';

interface NotificationRow {
    id: string;
    title?: string;
    message?: string;
    url?: string | null;
    read_at: string | null;
    created_at: string;
}

export default function Notifications() {
    const page = usePage<PageProps & { notifications: { data: NotificationRow[]; current_page: number; last_page: number }; unreadCount: number }>();

    return (
        <AppLayout>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                {page.props.unreadCount > 0 && (
                    <Button variant="secondary" onClick={() => router.post(route('notifications.read-all'))}>
                        Mark all read ({page.props.unreadCount})
                    </Button>
                )}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {page.props.notifications.data.length === 0 ? (
                    <EmptyState title="No notifications yet" message="Deposit confirmations, commissions and rank updates will appear here." />
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {page.props.notifications.data.map((notification) => (
                            <li key={notification.id} className={`flex items-start justify-between gap-4 px-5 py-4 ${!notification.read_at ? 'bg-indigo-50/40' : ''}`}>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                    <p className="mt-0.5 text-sm text-gray-600">{notification.message}</p>
                                    <p className="mt-1 text-xs text-gray-400">{formatDateTime(notification.created_at)}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    {notification.url && (
                                        <a href={notification.url} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                            View
                                        </a>
                                    )}
                                    {!notification.read_at && (
                                        <button onClick={() => router.patch(route('notifications.read', notification.id))} className="text-xs text-gray-400 hover:text-gray-600">
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <Pagination currentPage={page.props.notifications.current_page} lastPage={page.props.notifications.last_page} />
            </div>
        </AppLayout>
    );
}
