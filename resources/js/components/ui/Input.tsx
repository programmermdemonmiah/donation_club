import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/format';

const base =
    'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500';

export function Label({ children }: { children: React.ReactNode }) {
    return <span className="mb-1.5 block text-sm font-medium text-gray-700">{children}</span>;
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
    if (!children) return null;
    return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, className, id, ...props }, ref) {
    return (
        <div>
            {label && <Label>{label}</Label>}
            <input ref={ref} id={id} {...props} className={cn(base, error && 'border-rose-400', className)} />
            <ErrorText>{error}</ErrorText>
        </div>
    );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export function Select({ label, error, className, children, ...props }: SelectProps) {
    return (
        <div>
            {label && <Label>{label}</Label>}
            <select {...props} className={cn(base, 'pr-8', error && 'border-rose-400', className)}>
                {children}
            </select>
            <ErrorText>{error}</ErrorText>
        </div>
    );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
    return (
        <div>
            {label && <Label>{label}</Label>}
            <textarea rows={3} {...props} className={cn(base, error && 'border-rose-400', className)} />
            <ErrorText>{error}</ErrorText>
        </div>
    );
}
