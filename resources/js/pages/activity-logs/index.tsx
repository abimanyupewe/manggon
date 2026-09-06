import { Head, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ActivityLog, BreadcrumbItem, SharedData } from '@/types';
import {
    History,
    ShieldAlert,
    User,
    Clock,
    Filter,
    Globe,
    FileText,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Audit Trail Log',
        href: '/activity-logs',
    },
];

interface ActivityLogsIndexProps {
    logs: (ActivityLog & {
        user?: {
            id: number;
            name: string;
            username: string;
            role: string;
        };
    })[];
}

export default function ActivityLogsIndex({ logs = [] }: ActivityLogsIndexProps) {
    const [actionFilter, setActionFilter] = useState<string>('all');

    const actions = Array.from(new Set(logs.map((l) => l.action)));

    const filteredLogs = logs.filter((l) => {
        if (actionFilter !== 'all' && l.action !== actionFilter) return false;
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Trail & Jejak Aktivitas" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Audit Trail Log Sistem
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Rekam jejak seluruh mutasi data dan aktivitas operasional staf untuk mitigasi fraud dan audit kepatuhan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Hak Akses Pemilik (Owner Only)
                        </span>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-zinc-500">
                            <Filter className="h-3.5 w-3.5" /> Jenis Aksi:
                        </span>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            <option value="all">Semua Aktivitas</option>
                            {actions.map((act) => (
                                <option key={act} value={act}>
                                    {act}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-zinc-500">
                        Total <strong>{filteredLogs.length}</strong> catatan aktivitas
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-800/60 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Waktu & Tanggal</th>
                                    <th className="px-5 py-3">Pelaksana</th>
                                    <th className="px-5 py-3">Aksi</th>
                                    <th className="px-5 py-3">Deskripsi Aktivitas</th>
                                    <th className="px-5 py-3">Jejak Jaringan (IP)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                                        <td className="px-5 py-3.5 font-mono text-zinc-500 shrink-0">
                                            <div>
                                                {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-[11px] text-zinc-400 mt-0.5">
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-semibold text-zinc-900 dark:text-white">
                                                {log.user?.name || 'Sistem / Otomatis'}
                                            </div>
                                            {log.user && (
                                                <div className="text-[11px] text-zinc-400">
                                                    @{log.user.username} ({log.user.role})
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-700 dark:text-zinc-300 text-[11px]">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-md">
                                            {log.description}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-zinc-400 text-[11px]">
                                            <div className="flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {log.ip_address || '127.0.0.1'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
