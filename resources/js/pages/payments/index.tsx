import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Payment, PaymentStatus, Property, SharedData, User } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import {
    CreditCard,
    Plus,
    CheckCircle2,
    XCircle,
    Eye,
    Filter,
    X,
    FileText,
    Calendar,
    Building2,
    DollarSign,
    Trash2,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Tagihan & Finansial',
        href: '/payments',
    },
];

interface PaymentsIndexProps {
    payments: (Payment & {
        tenant?: User;
        property?: Property;
        room?: {
            id: number;
            room_number: string;
        };
        verifier?: {
            id: number;
            name: string;
        };
    })[];
    properties?: Property[];
    tenants?: (User & {
        property?: Property;
        tenant_profile?: {
            room?: {
                id: number;
                room_number: string;
                property_id: number;
                price: number;
            };
        };
    })[];
}

export default function PaymentsIndex({
    payments = [],
    properties = [],
    tenants = [],
}: PaymentsIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const isOwner = auth.user.role === 'owner';

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [reviewPayment, setReviewPayment] = useState<Payment | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    // Form Buat Tagihan (Owner Only)
    const createForm = useForm({
        tenant_id: tenants.length > 0 ? String(tenants[0].id) : '',
        billing_period: `${new Date().toLocaleString('id-ID', { month: 'long' })} ${new Date().getFullYear()}`,
        amount: 1500000,
        notes: 'Tagihan sewa bulanan rutin',
    });

    const handleTenantSelectChange = (tenantId: string) => {
        createForm.setData('tenant_id', tenantId);
        const selected = tenants.find((t) => String(t.id) === tenantId);
        if (selected?.tenant_profile?.room?.price) {
            createForm.setData('amount', Number(selected.tenant_profile.room.price));
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const selected = tenants.find((t) => String(t.id) === createForm.data.tenant_id);
        const propertyId = selected?.property_id || selected?.tenant_profile?.room?.property_id;
        const roomId = selected?.tenant_profile?.room?.id;

        if (!propertyId || !roomId) {
            alert('Anak kos yang dipilih belum memiliki kamar atau cabang aktif.');
            return;
        }

        createForm.transform((data) => ({
            tenant_id: Number(data.tenant_id),
            property_id: propertyId,
            room_id: roomId,
            billing_period: data.billing_period,
            amount: Number(data.amount),
            notes: data.notes || null,
        }));

        createForm.post('/payments', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleVerify = (paymentId: number) => {
        router.post(`/payments/${paymentId}/verify`, {}, {
            onSuccess: () => setReviewPayment(null),
        });
    };

    const handleReject = (paymentId: number) => {
        if (!rejectionReason.trim()) {
            alert('Harap masukkan alasan penolakan bukti transfer.');
            return;
        }

        router.post(
            `/payments/${paymentId}/reject`,
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    setReviewPayment(null);
                    setRejectionReason('');
                    setShowRejectInput(false);
                },
            }
        );
    };

    const handleDelete = (paymentId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus tagihan sewa ini?')) {
            router.delete(`/payments/${paymentId}`);
        }
    };

    const filteredPayments = payments.filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pembayaran & Tagihan" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Tagihan & Pembayaran Sewa
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {isOwner
                                ? 'Kontrol Finansial Mutlak: Terbitkan tagihan sewa bulanan dan pantau pemasukan cabang.'
                                : 'Validasi bukti transfer sewa mandiri yang diunggah oleh anak kos cabang Anda.'}
                        </p>
                    </div>

                    {isOwner && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            Buat Tagihan Baru
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-zinc-500">
                            <Filter className="h-3.5 w-3.5" /> Status:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            <option value="all">Semua Status Tagihan</option>
                            <option value="pending_verification">Perlu Verifikasi (Prioritas)</option>
                            <option value="unpaid">Belum Dibayar</option>
                            <option value="paid">Lunas (Terverifikasi)</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>

                    <div className="text-zinc-500">
                        Total <strong>{filteredPayments.length}</strong> transaksi
                    </div>
                </div>

                {/* Payments Table */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-800/60 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Invoice & Periode</th>
                                    <th className="px-5 py-3">Anak Kos & Kamar</th>
                                    <th className="px-5 py-3">Nominal Tagihan</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Verifikator Staf</th>
                                    <th className="px-5 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                {filteredPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                                        <td className="px-5 py-3.5">
                                            <div className="font-mono font-bold text-zinc-900 dark:text-white">
                                                {p.invoice_number}
                                            </div>
                                            <div className="text-zinc-400 mt-0.5">
                                                Periode: {p.billing_period}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                {p.tenant?.name || 'Anak Kos'}
                                            </div>
                                            <div className="text-zinc-400 mt-0.5">
                                                Kamar {p.room?.room_number || '-'} ({p.property?.name})
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                                Rp {Number(p.amount).toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-500">
                                            {p.verifier ? (
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                    ✓ {p.verifier.name}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-right space-x-2">
                                            {p.proof_image ? (
                                                <button
                                                    onClick={() => {
                                                        setReviewPayment(p);
                                                        setShowRejectInput(false);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold hover:bg-amber-100 transition cursor-pointer"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Tinjau Bukti
                                                </button>
                                            ) : (
                                                <span className="text-zinc-400 text-[11px] italic">
                                                    Belum Ada Bukti
                                                </span>
                                            )}

                                            {isOwner && (
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-1 rounded-lg text-rose-400 hover:text-rose-600 transition cursor-pointer"
                                                    title="Hapus Tagihan"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Buat Tagihan (Owner Only) */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                    Terbitkan Tagihan Sewa Baru
                                </h3>
                                <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg text-zinc-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Pilih Anak Kos *
                                    </label>
                                    <select
                                        value={createForm.data.tenant_id}
                                        onChange={(e) => handleTenantSelectChange(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        {tenants.map((t) => (
                                            <option key={t.id} value={String(t.id)}>
                                                {t.name} (Kamar {t.tenant_profile?.room?.room_number} - {t.property?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Periode Tagihan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.billing_period}
                                        onChange={(e) => createForm.setData('billing_period', e.target.value)}
                                        placeholder="Contoh: Oktober 2026"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Nominal Sewa (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={100000}
                                        step={50000}
                                        value={createForm.data.amount}
                                        onChange={(e) => createForm.setData('amount', Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Catatan Invoice
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.notes}
                                        onChange={(e) => createForm.setData('notes', e.target.value)}
                                        placeholder="Jatuh tempo tanggal 10 bulan ini"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing || tenants.length === 0}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Terbitkan Tagihan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Review Bukti Bayar & Validasi (Staff & Owner) */}
                {reviewPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                        Verifikasi Bukti Transfer
                                    </h3>
                                    <span className="text-xs font-mono text-zinc-500">
                                        {reviewPayment.invoice_number} ({reviewPayment.billing_period})
                                    </span>
                                </div>
                                <button onClick={() => setReviewPayment(null)} className="p-1 rounded-lg text-zinc-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/40 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Anak Kos:</span>
                                        <span className="font-semibold">{reviewPayment.tenant?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Kamar:</span>
                                        <span className="font-semibold">Kamar {reviewPayment.room?.room_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Nominal Transfer:</span>
                                        <span className="font-bold text-emerald-600">
                                            Rp {Number(reviewPayment.amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                {/* Proof Image Preview */}
                                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                    <img
                                        src={reviewPayment.proof_image || ''}
                                        alt="Bukti Transfer"
                                        className="w-full max-h-72 object-contain mx-auto"
                                    />
                                </div>

                                {reviewPayment.notes && (
                                    <p className="text-xs text-zinc-500 italic">
                                        Catatan Tenant: "{reviewPayment.notes}"
                                    </p>
                                )}

                                {/* Reject Input Form */}
                                {showRejectInput && (
                                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                        <label className="block text-xs font-semibold text-rose-600">
                                            Alasan Penolakan Bukti *
                                        </label>
                                        <textarea
                                            rows={2}
                                            required
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Nominal tidak sesuai, struk tidak terbaca, dll."
                                            className="w-full rounded-xl border border-rose-300 p-2 text-xs focus:border-rose-500 focus:outline-none dark:border-rose-800 dark:bg-zinc-800"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    {!showRejectInput ? (
                                        <>
                                            <button
                                                onClick={() => setShowRejectInput(true)}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer transition"
                                            >
                                                <XCircle className="h-4 w-4" /> Tolak Bukti
                                            </button>
                                            <button
                                                onClick={() => handleVerify(reviewPayment.id)}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer transition"
                                            >
                                                <CheckCircle2 className="h-4 w-4" /> Validasi (Lunas)
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setShowRejectInput(false)}
                                                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={() => handleReject(reviewPayment.id)}
                                                className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                            >
                                                Kirim Penolakan
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
