import { cn } from '@/utils/format';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: 'sm' | 'md';
    loading?: boolean;
}

const variants: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-600',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400',
    outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-blue-600',
};

export default function Button({ variant = 'primary', size = 'md', loading, className, disabled, children, ...props }: Props) {
    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm',
                variants[variant],
                className,
            )}
        >
            {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            )}
            {children}
        </button>
    );
}
