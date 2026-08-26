export default function EmptyState({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4l-1.5 2h-5L12 13H4" />
            </svg>
            <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
            {message && <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
