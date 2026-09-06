import React from 'react';

type StatusType =
    | 'empty'
    | 'occupied'
    | 'maintenance'
    | 'unpaid'
    | 'pending_verification'
    | 'paid'
    | 'rejected'
    | 'pending'
    | 'approved'
    | 'in_progress'
    | 'resolved';

interface StatusBadgeProps {
    status: string;
    label?: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; styles: string; dot: string }> = {
    // Room Status
    empty: {
        label: 'Kosong / Siap Huni',
        styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
    },
    occupied: {
        label: 'Terisi',
        styles: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
        dot: 'bg-sky-500',
    },
    maintenance: {
        label: 'Dalam Perbaikan',
        styles: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
    },

    // Payment Status
    unpaid: {
        label: 'Belum Lunas',
        styles: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
    },
    pending_verification: {
        label: 'Perlu Verifikasi',
        styles: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-semibold',
        dot: 'bg-amber-500 animate-pulse',
    },
    paid: {
        label: 'Lunas',
        styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
    },

    // Security & General
    pending: {
        label: 'Menunggu',
        styles: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
    },
    approved: {
        label: 'Disetujui',
        styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
    },
    rejected: {
        label: 'Ditolak',
        styles: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        dot: 'bg-zinc-400',
    },

    // Complaint Status
    in_progress: {
        label: 'Dikerjakan',
        styles: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500 animate-pulse',
    },
    resolved: {
        label: 'Selesai',
        styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
    },
};

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        styles: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300',
        dot: 'bg-zinc-400',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.styles} ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {label || config.label}
        </span>
    );
}
