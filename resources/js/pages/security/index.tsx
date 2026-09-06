import { Head, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SecurityLog, SharedData, User } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import {
    ShieldCheck,
    Moon,
    UserCheck,
    CheckCircle2,
    XCircle,
    Calendar,
    Clock,
    Filter,
    X,
    User as UserIcon,
    AlertCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Satpam Digital',
        href: '/security-logs',
    },
];

interface SecurityIndexProps {
    logs: (SecurityLog & {
        tenant?: User & {
            tenant_profile?: {
                room?: {
                    room_number: string;
                };
            };
        };
        approver?: User;
    })[];
}

export default function SecurityIndex({ logs = [] }: SecurityIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const isOwner = auth.user.role === 'owner';

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [rejectingLog, setRejectingLog] = useState<SecurityLog | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = (logId: number) => {
        router.post(`/security-logs/${logId}/approve`);
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingLog || !rejectionReason.trim()) return;

        router.post(
            `/security-logs/${rejectingLog.id}/reject`,
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    setRejectingLog(null);
                    setRejectionReason('');
                },
            }
        );
    };

    const filteredLogs = logs.filter((log) => {
        if (statusFilter !== 'all' && log.status !== statusFilter) return false;
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Action Center Satpam Digital" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Action Center Satpam Digital
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Persetujuan izin pulang malam dan buku tamu khusus wanita sesuai tata tertib ketat kos putri.
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-zinc-500">
                            <Filter className="h-3.5 w-3.5" /> Status Izin:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            <option value="all">Semua Permohonan</option>
                            <option value="pending">Menunggu Konfirmasi (Prioritas)</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>

                    <div className="text-zinc-500">
                        Total <strong>{filteredLogs.length}</strong> permohonan tercatat
                    </div>
                </div>

                {/* Logs List */}
                <div className="space-y-3">
                    {filteredLogs.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 text-zinc-400 text-xs">
                            <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                            Tidak ada permohonan izin dalam kategori ini.
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${
                                            log.type === 'late_return'
                                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                        }`}
                                    >
                                        {log.type === 'late_return' ? (
                                            <Moon className="h-5 w-5" />
                                        ) : (
                                            <UserCheck className="h-5 w-5" />
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                                {log.tenant?.name || 'Anak Kos'}
                                            </span>
                                            <span className="text-xs text-zinc-400">
                                                (Kamar {log.tenant?.tenant_profile?.room?.room_number || '-'})
                                            </span>
                                            <StatusBadge status={log.status} />
                                        </div>

                                        <div className="text-xs text-zinc-600 dark:text-zinc-300">
                                            {log.type === 'late_return' ? (
                                                <span>Izin Pulang Larut Malam: Perkiraan tiba jam <strong>{log.planned_time}</strong></span>
                                            ) : (
                                                <span>Kunjungan Tamu Wanita: <strong>{log.guest_name}</strong> (Jam: {log.planned_time})</span>
                                            )}
                                        </div>

                                        {log.notes && (
                                            <p className="text-xs text-zinc-500 italic">
                                                Alasan: "{log.notes}"
                                            </p>
                                        )}

                                        <div className="text-[11px] text-zinc-400 flex items-center gap-4 pt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {log.date}
                                            </span>
                                            {log.approver && (
                                                <span>
                                                    Diproses oleh: <strong>{log.approver.name}</strong>
                                                </span>
                                            )}
                                            {log.rejection_reason && (
                                                <span className="text-rose-500 font-medium">
                                                    Alasan ditolak: {log.rejection_reason}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {log.status === 'pending' && (
                                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                                        <button
                                            onClick={() => setRejectingLog(log)}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                        >
                                            <XCircle className="h-3.5 w-3.5" /> Tolak
                                        </button>
                                        <button
                                            onClick={() => handleApprove(log.id)}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Izinkan
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Reject Reason Modal */}
                {rejectingLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                    Tolak Permohonan Izin
                                </h3>
                                <button onClick={() => setRejectingLog(null)} className="p-1 rounded-lg text-zinc-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleReject} className="mt-4 space-y-4 text-sm">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Alasan Penolakan Izin *
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Melebihi batas jam malam yang diizinkan / Tamu pria dilarang masuk..."
                                        className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-xs focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setRejectingLog(null)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                    >
                                        Kirim Penolakan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
