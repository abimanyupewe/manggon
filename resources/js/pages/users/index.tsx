import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Property, Room, SharedData, User } from '@/types';
import {
    Users,
    UserPlus,
    Copy,
    Check,
    X,
    Filter,
    KeyRound,
    Phone,
    Mail,
    BedDouble,
    Building2,
    Shield,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pengguna & Kredensial',
        href: '/users',
    },
];

interface UsersIndexProps {
    users: (User & {
        property?: Property;
        tenant_profile?: {
            room?: Room;
            emergency_contact_name?: string;
            emergency_contact_phone?: string;
        };
    })[];
    properties?: Property[];
    available_rooms?: (Room & { property?: Property })[];
}

export default function UsersIndex({
    users = [],
    properties = [],
    available_rooms = [],
}: UsersIndexProps) {
    const { auth, flash } = usePage<SharedData & { flash?: any }>().props;
    const isOwner = auth.user.role === 'owner';

    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{
        username: string;
        temporary_password: string;
        role: string;
        name: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    // Form Staff
    const staffForm = useForm({
        name: '',
        email: '',
        phone_number: '',
        property_id: properties.length > 0 ? String(properties[0].id) : '',
    });

    // Form Tenant
    const tenantForm = useForm({
        name: '',
        email: '',
        phone_number: '',
        room_id: available_rooms.length > 0 ? String(available_rooms[0].id) : '',
        identity_card_number: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: 'Orang Tua / Wali',
    });

    const handleGenerateStaff = (e: React.FormEvent) => {
        e.preventDefault();
        staffForm.post('/users/generate-staff', {
            onSuccess: (page: any) => {
                const creds = page.props.flash?.generated_credentials;
                if (creds) {
                    setGeneratedCredentials({
                        username: creds.username,
                        temporary_password: creds.temporary_password,
                        role: 'Staf Penjaga',
                        name: staffForm.data.name,
                    });
                }
                setIsStaffModalOpen(false);
                staffForm.reset();
            },
        });
    };

    const handleGenerateTenant = (e: React.FormEvent) => {
        e.preventDefault();
        tenantForm.post('/users/generate-tenant', {
            onSuccess: (page: any) => {
                const creds = page.props.flash?.generated_credentials;
                if (creds) {
                    setGeneratedCredentials({
                        username: creds.username,
                        temporary_password: creds.temporary_password,
                        role: 'Anak Kos Putri',
                        name: tenantForm.data.name,
                    });
                }
                setIsTenantModalOpen(false);
                tenantForm.reset();
            },
        });
    };

    const copyToClipboard = () => {
        if (!generatedCredentials) return;
        const text = `Kredensial Akses Manggon:\nNama: ${generatedCredentials.name} (${generatedCredentials.role})\nUsername: ${generatedCredentials.username}\nPassword Sementara: ${generatedCredentials.temporary_password}\nHarap segera perbarui kata sandi saat pertama kali login.`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const filteredUsers = users.filter((u) => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna & Kredensial" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Pengguna & Kredensial Akun
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {isOwner
                                ? 'Generate akun staf dan anak kos dengan format lowercase unik dan password acak aman.'
                                : 'Daftar anak kos yang terdaftar di cabang Anda.'}
                        </p>
                    </div>

                    {isOwner && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setIsStaffModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition cursor-pointer"
                            >
                                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                                Generate Staf
                            </button>
                            <button
                                onClick={() => setIsTenantModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                Generate Anak Kos
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter */}
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-zinc-500">
                            <Filter className="h-3.5 w-3.5" /> Peran:
                        </span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            <option value="all">Semua Pengguna</option>
                            <option value="staff">Hanya Staf Jaga</option>
                            <option value="tenant">Hanya Anak Kos</option>
                        </select>
                    </div>

                    <div className="text-zinc-500">
                        Total <strong>{filteredUsers.length}</strong> akun terdaftar
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-800/60 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Nama Pengguna</th>
                                    <th className="px-5 py-3">Username & Kontak</th>
                                    <th className="px-5 py-3">Peran / Penempatan</th>
                                    <th className="px-5 py-3">Kamar</th>
                                    <th className="px-5 py-3">Status Akun</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                                        <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-white">
                                            {user.name}
                                            {user.must_change_password && (
                                                <span className="block text-[10px] text-amber-600 font-normal">
                                                    Wajib Ganti Sandi Perdana
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300">
                                            <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                                @{user.username}
                                            </div>
                                            <div className="text-zinc-400 mt-0.5">
                                                {user.phone_number || '-'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-block rounded-md px-2 py-0.5 font-semibold text-[11px] ${
                                                    user.role === 'owner'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                                        : user.role === 'staff'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                }`}
                                            >
                                                {user.role === 'owner' ? 'Pemilik' : user.role === 'staff' ? 'Staf Jaga' : 'Anak Kos'}
                                            </span>
                                            <div className="text-zinc-400 text-[11px] mt-0.5">
                                                {user.property?.name || 'Seluruh Cabang'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono">
                                            {user.tenant_profile?.room ? (
                                                <span className="font-bold text-zinc-700 dark:text-zinc-200">
                                                    Kamar {user.tenant_profile.room.room_number}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                    user.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                                                }`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                                {user.is_active ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Success Generated Credentials Dialog */}
                {generatedCredentials && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
                            <div className="flex items-center gap-3 text-emerald-600 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950">
                                    <KeyRound className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                        Akun Berhasil Dibuat!
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Kredensial login acak sistem siap dibagikan
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3 rounded-xl bg-zinc-50 p-4 border border-zinc-200/80 dark:bg-zinc-800/40 dark:border-zinc-800 text-xs">
                                <div>
                                    <span className="text-zinc-400">Nama Pengguna:</span>
                                    <div className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5">
                                        {generatedCredentials.name} ({generatedCredentials.role})
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-700">
                                    <div>
                                        <span className="text-zinc-400">Username (Strict Lowercase):</span>
                                        <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            {generatedCredentials.username}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-zinc-400">Password Sementara:</span>
                                        <div className="font-mono font-bold text-sm text-zinc-900 dark:text-white mt-0.5 bg-white px-2 py-0.5 rounded-md border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
                                            {generatedCredentials.temporary_password}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed">
                                Catatan: Pengguna wajib mengganti kata sandi ini saat pertama kali melakukan login ke dalam sistem.
                            </p>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer transition"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" /> Tersalin ke Clipboard!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" /> Salin Kredensial
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setGeneratedCredentials(null)}
                                    className="rounded-xl border border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Staff Modal */}
                {isStaffModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                    Generate Akun Staf Penjaga
                                </h3>
                                <button onClick={() => setIsStaffModalOpen(false)} className="p-1 rounded-lg text-zinc-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleGenerateStaff} className="mt-4 space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Nama Lengkap Staf *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={staffForm.data.name}
                                        onChange={(e) => staffForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Dewi Lestari"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                    <span className="text-[11px] text-zinc-400">
                                        Username otomatis: nama depan + 4 digit nomor HP
                                    </span>
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Nomor Telepon / WA *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={staffForm.data.phone_number}
                                        onChange={(e) => staffForm.setData('phone_number', e.target.value)}
                                        placeholder="081234567890"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Email (Opsional)
                                    </label>
                                    <input
                                        type="email"
                                        value={staffForm.data.email}
                                        onChange={(e) => staffForm.setData('email', e.target.value)}
                                        placeholder="dewi@manggon.test"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Cabang Penugasan *
                                    </label>
                                    <select
                                        value={staffForm.data.property_id}
                                        onChange={(e) => staffForm.setData('property_id', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        {properties.map((p) => (
                                            <option key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsStaffModalOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={staffForm.processing}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Buat Akun Staf
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Generate Tenant Modal */}
                {isTenantModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                    Generate Akun Anak Kos Putri
                                </h3>
                                <button onClick={() => setIsTenantModalOpen(false)} className="p-1 rounded-lg text-zinc-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleGenerateTenant} className="mt-4 space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Nama Lengkap Anak Kos *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={tenantForm.data.name}
                                        onChange={(e) => tenantForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Bunga Citra"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                    <span className="text-[11px] text-zinc-400">
                                        Username unik otomatis: kamus kata (hewan/buah) + nomor kamar
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Nomor Telepon / WA *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={tenantForm.data.phone_number}
                                            onChange={(e) => tenantForm.setData('phone_number', e.target.value)}
                                            placeholder="081987654321"
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Email (Opsional)
                                        </label>
                                        <input
                                            type="email"
                                            value={tenantForm.data.email}
                                            onChange={(e) => tenantForm.setData('email', e.target.value)}
                                            placeholder="bunga@mail.com"
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Pilih Kamar Kosong *
                                    </label>
                                    <select
                                        required
                                        value={tenantForm.data.room_id}
                                        onChange={(e) => tenantForm.setData('room_id', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        {available_rooms.length === 0 ? (
                                            <option value="">Tidak ada kamar kosong tersedia</option>
                                        ) : (
                                            available_rooms.map((r) => (
                                                <option key={r.id} value={String(r.id)}>
                                                    Kamar {r.room_number} ({r.property?.name} - Lt. {r.floor}) - Rp {Number(r.price).toLocaleString('id-ID')}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                    <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
                                        Kontak Darurat (Demi Keamanan)
                                    </span>
                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Nama Kontak Darurat"
                                            value={tenantForm.data.emergency_contact_name}
                                            onChange={(e) => tenantForm.setData('emergency_contact_name', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="No. Telp Darurat"
                                            value={tenantForm.data.emergency_contact_phone}
                                            onChange={(e) => tenantForm.setData('emergency_contact_phone', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsTenantModalOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={tenantForm.processing || available_rooms.length === 0}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Daftarkan Anak Kos
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
