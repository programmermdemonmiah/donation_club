import { statusColor } from '@/utils/format';
import { cn } from '@/utils/format';

export default function Badge({ value, label, className }: { value: string; label?: string; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize',
                statusColor(value),
                className,
            )}
        >
            {label ?? value.replace(/_/g, ' ')}
        </span>
    );
}
