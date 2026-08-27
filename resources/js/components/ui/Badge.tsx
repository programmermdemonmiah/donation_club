import { statusColor } from '@/utils/format';
import { cn } from '@/utils/format';

export default function Badge({ 
    value, 
    label, 
    color, 
    className, 
    children 
}: { 
    value?: string; 
    label?: string; 
    color?: string;
    className?: string;
    children?: React.ReactNode;
}) {
    const displayValue = value ?? '';
    const content = children ?? label ?? displayValue.replace(/_/g, ' ');
    
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize',
                color ? statusColor(color) : statusColor(displayValue),
                className,
            )}
        >
            {content}
        </span>
    );
}
