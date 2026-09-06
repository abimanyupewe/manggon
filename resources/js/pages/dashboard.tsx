import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import {
    Building2,
    BedDouble,
    CreditCard,
    ShieldCheck,
    Wrench,
    Users,
    TrendingUp,
    Clock,
    AlertCircle,
    ArrowUpRight,
    CheckCircle2,
    MapPin,
    Smartphone,
    UserCheck,
    History,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    role: 'owner' | 'staff' | 'tenant';
    stats?: Record<string, any>;
    properties?: any[];
    property?: any;
    action_center?: {
        pending_payments: any[];
        pending_security_logs: any[];
        active_complaints: any[];
    };
    recent_activities?: any[];
    tenant?: any;
    pending_bills?: any[];
    recent_logs?: any[];
}

export default function Dashboard({
    role,
    stats = {},
    properties = [],
    property,
    action_center,
    recent_activities = [],
    tenant,
    pending_bills = [],
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* 1. Header Greeting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                            Selamat Datang, {user.name}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {role === 'owner' && 'Executive Overview: Pantau performa finansial dan operasional multi-cabang kos.'}
                            {role === 'staff' && `Action Center Cabang: ${property?.name || 'Tugas Harian Anda'}`}
                            {role === 'tenant' && 'Portal Hunian Anda: Info kamar, status pembayaran, dan layanan kos.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Role: {role.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* 2. OWNER VIEW */}
                {role === 'owner' && (
                    <div className="space-y-8">
                        {/* KPI Cards Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                                    <span>Tingkat Okupansi</span>
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                                        {stats.occupancy_rate || 0}%
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                        ({stats.occupied_rooms || 0}/{stats.total_rooms || 0} Kamar)
                                    </span>
                                </div>
                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${Math.min(stats.occupancy_rate || 0, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                                    <span>Pendapatan Bulan Ini</span>
                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div className="mt-3">
                                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                        Rp {(stats.monthly_revenue || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-zinc-500">
                                    {stats.unpaid_payments_count || 0} Tagihan Belum Lunas
                                </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                                    <span>Verifikasi Tertunda</span>
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="mt-3">
                                    <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                                        {stats.pending_payments_count || 0}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-zinc-500">
                                    Bukti transfer siap diverifikasi
                                </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
                                    <span>Tiket Keluhan Aktif</span>
                                    <Wrench className="h-4 w-4 text-sky-500" />
                                </div>
                                <div className="mt-3">
                                    <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                                        {stats.open_complaints_count || 0}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-zinc-500">
                                    Kerusakan fasilitas dilaporkan
                                </p>
                            </div>
                        </div>

                        {/* Quick Shortcuts & Branches Overview */}
                        <div className="grid gap-6 lg:grid-cols-12">
                            {/* Branch Cards */}
                            <div className="lg:col-span-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white">
                                            Status Cabang Properti
                                        </h3>
                                        <p className="text-xs text-zinc-500">
                                            Ringkasan unit kamar di setiap lokasi kos Manggon
                                        </p>
                                    </div>
                                    <Link
                                        href="/properties"
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                        Kelola Cabang <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    {properties.map((p) => (
                                        <div
                                            key={p.id}
                                            className="rounded-xl border border-zinc-200/80 p-4 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                                                        {p.name}
                                                    </h4>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="h-3 w-3" /> {p.address}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2 py-0.5 font-semibold">
                                                    {p.empty_rooms_count} Kosong
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                                                <span>Total {p.rooms_count} Kamar</span>
                                                <span>{p.staff_count} Staf Jaga</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions Bento */}
                            <div className="lg:col-span-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                                <h3 className="font-bold text-zinc-900 dark:text-white">
                                    Tindakan Cepat Pemilik
                                </h3>

                                <div className="space-y-2.5">
                                    <Link
                                        href="/users"
                                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 dark:border-zinc-800 dark:hover:bg-emerald-950/20 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Generate Akun Staf/Tenant
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    Buat akun otomatis huruf kecil
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600" />
                                    </Link>

                                    <Link
                                        href="/payments"
                                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 dark:border-zinc-800 dark:hover:bg-emerald-950/20 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Terbitkan Tagihan Sewa
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    Kontrol finansial mutlak
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600" />
                                    </Link>

                                    <Link
                                        href="/activity-logs"
                                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 dark:border-zinc-800 dark:hover:bg-emerald-950/20 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                <History className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Pantau Audit Trail
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    Log pencegahan fraud staf
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Logs Stream */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white">
                                        Audit Trail Terbaru
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Rekam aktivitas seluruh cabang untuk transparansi operasional
                                    </p>
                                </div>
                                <Link
                                    href="/activity-logs"
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                >
                                    Selengkapnya <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
                                {recent_activities.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-zinc-400">
                                        Belum ada rekaman log audit aktivitas.
                                    </div>
                                ) : (
                                    recent_activities.map((log: any) => (
                                        <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-sm text-zinc-800 dark:text-zinc-200">
                                                    {log.description}
                                                </div>
                                                <div className="text-xs text-zinc-400 mt-0.5">
                                                    Oleh: <span className="font-medium text-zinc-600 dark:text-zinc-300">{log.user?.name || 'Sistem'}</span> ({log.action})
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-zinc-400 shrink-0">
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. STAFF VIEW ("Inbox-Zero Action Center") */}
                {role === 'staff' && (
                    <div className="space-y-8">
                        {/* Branch Info Banner */}
                        <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-md">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
                                        Cabang Penugasan Anda
                                    </span>
                                    <h2 className="text-2xl font-bold mt-1">
                                        {property?.name || 'Cabang Kos'}
                                    </h2>
                                    <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" /> {property?.address}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                                    <div>
                                        <div className="text-emerald-200">Kamar Kosong</div>
                                        <div className="text-lg font-bold">{stats.empty_rooms || 0} Siap Huni</div>
                                    </div>
                                    <div className="h-8 w-px bg-white/20" />
                                    <div>
                                        <div className="text-emerald-200">Terisi</div>
                                        <div className="text-lg font-bold">{stats.occupied_rooms || 0} Anak Kos</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Center - 3 Pillars To-Do */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* 1. Pembayaran yang Perlu Diverifikasi */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                                            Verifikasi Bukti Transfer
                                        </h3>
                                    </div>
                                    <span className="rounded-full bg-amber-100 text-amber-800 text-xs px-2 py-0.5 font-bold">
                                        {stats.pending_verifications_count || 0}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {action_center?.pending_payments?.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-zinc-400">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                                            Inbox Zero: Tidak ada bukti bayar yang menunggu verifikasi.
                                        </div>
                                    ) : (
                                        action_center?.pending_payments?.map((payment: any) => (
                                            <div
                                                key={payment.id}
                                                className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-2"
                                            >
                                                <div className="flex justify-between font-semibold">
                                                    <span>{payment.tenant?.name} (Kmr {payment.room?.room_number})</span>
                                                    <span className="text-emerald-600 font-bold">
                                                        Rp {Number(payment.amount).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="text-zinc-500">
                                                    Invoice: {payment.invoice_number}
                                                </div>
                                                <Link
                                                    href="/payments"
                                                    className="inline-block w-full text-center py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition"
                                                >
                                                    Tinjau Bukti & Validasi
                                                </Link>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 2. Permohonan Satpam Digital */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                                            Satpam Digital (Izin Malam/Tamu)
                                        </h3>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 font-bold">
                                        {stats.pending_security_count || 0}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {action_center?.pending_security_logs?.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-zinc-400">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                                            Tidak ada permohonan izin pulang malam baru.
                                        </div>
                                    ) : (
                                        action_center?.pending_security_logs?.map((log: any) => (
                                            <div
                                                key={log.id}
                                                className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-2"
                                            >
                                                <div className="flex justify-between font-semibold">
                                                    <span>{log.tenant?.name}</span>
                                                    <span className="text-zinc-500">{log.planned_time}</span>
                                                </div>
                                                <div className="text-zinc-600 dark:text-zinc-300">
                                                    {log.type === 'late_return' ? 'Izin Pulang Malam' : `Tamu: ${log.guest_name}`}
                                                </div>
                                                <Link
                                                    href="/security-logs"
                                                    className="inline-block w-full text-center py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
                                                >
                                                    Proses Persetujuan
                                                </Link>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 3. Tiket Keluhan Kamar */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                                            <Wrench className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                                            Tiket Keluhan Fasilitas
                                        </h3>
                                    </div>
                                    <span className="rounded-full bg-sky-100 text-sky-800 text-xs px-2 py-0.5 font-bold">
                                        {stats.active_complaints_count || 0}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {action_center?.active_complaints?.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-zinc-400">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                                            Semua fasilitas kamar dalam kondisi prima.
                                        </div>
                                    ) : (
                                        action_center?.active_complaints?.map((ticket: any) => (
                                            <div
                                                key={ticket.id}
                                                className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-2"
                                            >
                                                <div className="flex justify-between font-semibold">
                                                    <span>Kamar {ticket.room?.room_number}</span>
                                                    <StatusBadge status={ticket.status} />
                                                </div>
                                                <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                                                    {ticket.title}
                                                </div>
                                                <Link
                                                    href="/complaints"
                                                    className="inline-block w-full text-center py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition"
                                                >
                                                    Update Status Perbaikan
                                                </Link>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. TENANT VIEW */}
                {role === 'tenant' && (
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white border border-zinc-200 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                Kamar Hunian Anda
                            </h2>
                            <div className="mt-4 grid sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                    <div className="text-zinc-500">Cabang</div>
                                    <div className="font-bold text-sm mt-1">{tenant?.tenant_profile?.room?.property?.name || 'Cabang Kos'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                    <div className="text-zinc-500">Nomor Kamar</div>
                                    <div className="font-bold text-sm mt-1">Kamar {tenant?.tenant_profile?.room?.room_number || '-'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                    <div className="text-zinc-500">Tarif Sewa</div>
                                    <div className="font-bold text-sm text-emerald-600 mt-1">
                                        Rp {Number(tenant?.tenant_profile?.room?.price || 0).toLocaleString('id-ID')}/bln
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile App Prompt */}
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 dark:bg-emerald-950/30 dark:border-emerald-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-900 dark:text-emerald-200">
                                        Gunakan Aplikasi Mobile Manggon
                                    </h3>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                                        Lapor izin pulang malam, tamu wanita, dan unggah foto bukti transfer sewa mandiri lebih mudah lewat aplikasi ponsel.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
