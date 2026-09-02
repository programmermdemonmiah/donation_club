import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/format';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div ref={ref} className={cn('relative w-full rounded-xl bg-white shadow-2xl', maxWidth)}>
                {title && (
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    </div>
                )}
                <div className="px-5 py-4">{children}</div>
            </div>
        </div>,
        document.body,
    );
}

interface ConfirmProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    processing?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger, processing }: ConfirmProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
            <p className="text-sm text-gray-600">{message}</p>
            <div className="mt-5 flex justify-end gap-2">
                <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={processing}
                    className={cn(
                        'rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50',
                        danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-blue-600 hover:bg-blue-500',
                    )}
                >
                    {processing ? 'Working…' : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
