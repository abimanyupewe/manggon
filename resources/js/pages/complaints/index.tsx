import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ComplaintStatus, ComplaintTicket, Property, Room, SharedData, User } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import {
    Wrench,
    CheckCircle2,
    Clock,
    Filter,
    X,
    Eye,
    UserCheck,
    Calendar,
    MessageSquare,
    AlertCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Tiket Keluhan Fasilitas',
        href: '/complaints',
    },
];

interface ComplaintsIndexProps {
    complaints: (ComplaintTicket & {
        room?: Room;
        tenant?: User;
        property?: Property;
        handler?: User;
    })[];
}

export default function ComplaintsIndex({ complaints = [] }: ComplaintsIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);

    const updateForm = useForm({
        status: 'in_progress' as ComplaintStatus,
        resolution_notes: '',
    });

    const handleOpenModal = (ticket: ComplaintTicket) => {
        setSelectedTicket(ticket);
        updateForm.setData({
            status: ticket.status,
            resolution_notes: ticket.resolution_notes || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket) return;

        updateForm.patch(`/complaints/${selectedTicket.id}/status`, {
            onSuccess: () => {
                setSelectedTicket(null);
                updateForm.reset();
            },
        });
    };

    const filteredComplaints = complaints.filter((c) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tiket Keluhan Fasilitas Kamar" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Disposisi Keluhan Fasilitas Kamar
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Pantau laporan kerusakan AC, pipa air, atau listrik kamar dan disposisikan penanganan teknisi.
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-zinc-500">
                            <Filter className="h-3.5 w-3.5" /> Status Tiket:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            <option value="all">Semua Keluhan</option>
                            <option value="pending">Menunggu Tindakan (Prioritas)</option>
                            <option value="in_progress">Sedang Dikerjakan Teknisi</option>
                            <option value="resolved">Selesai Diperbaiki</option>
                            <option value="rejected">Ditolak / Batal</option>
                        </select>
                    </div>

                    <div className="text-zinc-500">
                        Total <strong>{filteredComplaints.length}</strong> tiket laporan
                    </div>
                </div>

                {/* Complaints List */}
                <div className="space-y-3">
                    {filteredComplaints.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 text-zinc-400 text-xs">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                            Tidak ada keluhan fasilitas yang perlu ditindaklanjuti.
                        </div>
                    ) : (
                        filteredComplaints.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">
                                            {ticket.ticket_number}
                                        </span>
                                        <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                            Kamar {ticket.room?.room_number || '-'} ({ticket.property?.name})
                                        </span>
                                        <StatusBadge status={ticket.status} />
                                    </div>

                                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                        {ticket.title}
                                    </h3>

                                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {ticket.description}
                                    </p>

                                    {ticket.photo_evidence && (
                                        <div className="pt-2">
                                            <a
                                                href={ticket.photo_evidence}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Lihat Foto Bukti Kerusakan
                                            </a>
                                        </div>
                                    )}

                                    {ticket.resolution_notes && (
                                        <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-300 mt-2">
                                            <strong>Catatan Penanganan:</strong> {ticket.resolution_notes}
                                        </div>
                                    )}

                                    <div className="text-[11px] text-zinc-400 flex items-center gap-4 pt-1">
                                        <span>Pelapor: <strong>{ticket.tenant?.name || 'Anak Kos'}</strong></span>
                                        {ticket.handler && (
                                            <span>Teknisi/Staf: <strong>{ticket.handler.name}</strong></span>
                                        )}
                                        <span>
                                            {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleOpenModal(ticket)}
                                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3.5 py-2 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white active:scale-95 transition cursor-pointer"
                                >
                                    <Wrench className="h-3.5 w-3.5" /> Update Progres
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Update Status Keluhan */}
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                        Update Penanganan Keluhan
                                    </h3>
                                    <span className="text-xs font-mono text-zinc-500">
                                        {selectedTicket.ticket_number} (Kamar {selectedTicket.room?.room_number})
                                    </span>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg text-zinc-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="mt-4 space-y-4 text-sm">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Status Pengerjaan *
                                    </label>
                                    <select
                                        value={updateForm.data.status}
                                        onChange={(e) => updateForm.setData('status', e.target.value as ComplaintStatus)}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        <option value="pending">Menunggu Tindakan</option>
                                        <option value="in_progress">Sedang Dikerjakan Teknisi</option>
                                        <option value="resolved">Selesai Diperbaiki</option>
                                        <option value="rejected">Ditolak / Tidak Valid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Catatan Penanganan & Solusi
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={updateForm.data.resolution_notes}
                                        onChange={(e) => updateForm.setData('resolution_notes', e.target.value)}
                                        placeholder="Contoh: Freon AC sudah diisi ulang oleh teknisi..."
                                        className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTicket(null)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateForm.processing}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Simpan Progres
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
