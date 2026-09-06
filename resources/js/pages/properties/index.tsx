import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Property, SharedData } from '@/types';
import {
    Building2,
    Plus,
    MapPin,
    Phone,
    CreditCard,
    BedDouble,
    Users,
    Edit2,
    Trash2,
    X,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Cabang Kos',
        href: '/properties',
    },
];

interface PropertiesIndexProps {
    properties: Property[];
}

export default function PropertiesIndex({ properties = [] }: PropertiesIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const isOwner = auth.user.role === 'owner';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const createForm = useForm({
        name: '',
        address: '',
        phone_number: '',
        description: '',
        facilities_string: '',
        bank: '',
        account_number: '',
        account_holder: '',
    });

    const editForm = useForm({
        name: '',
        address: '',
        phone_number: '',
        description: '',
        facilities_string: '',
        bank: '',
        account_number: '',
        account_holder: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const facilities = createForm.data.facilities_string
            ? createForm.data.facilities_string.split(',').map((f) => f.trim()).filter(Boolean)
            : [];

        createForm.transform((data) => ({
            name: data.name,
            address: data.address,
            phone_number: data.phone_number || null,
            description: data.description || null,
            facilities,
            bank_account_info: data.bank
                ? {
                      bank: data.bank,
                      account_number: data.account_number,
                      account_holder: data.account_holder,
                  }
                : null,
        }));

        createForm.post('/properties', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenEdit = (p: Property) => {
        setEditingProperty(p);
        editForm.setData({
            name: p.name,
            address: p.address,
            phone_number: p.phone_number || '',
            description: p.description || '',
            facilities_string: p.facilities ? p.facilities.join(', ') : '',
            bank: p.bank_account_info?.bank || '',
            account_number: p.bank_account_info?.account_number || '',
            account_holder: p.bank_account_info?.account_holder || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProperty) return;

        const facilities = editForm.data.facilities_string
            ? editForm.data.facilities_string.split(',').map((f) => f.trim()).filter(Boolean)
            : [];

        editForm.transform((data) => ({
            name: data.name,
            address: data.address,
            phone_number: data.phone_number || null,
            description: data.description || null,
            facilities,
            bank_account_info: data.bank
                ? {
                      bank: data.bank,
                      account_number: data.account_number,
                      account_holder: data.account_holder,
                  }
                : null,
        }));

        editForm.put(`/properties/${editingProperty.id}`, {
            onSuccess: () => {
                setEditingProperty(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (p: Property) => {
        if (confirm(`Apakah Anda yakin ingin menghapus cabang ${p.name}? Semua data kamar terkait akan ikut terhapus.`)) {
            router.delete(`/properties/${p.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Cabang Kos" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Daftar Cabang Kos
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {isOwner
                                ? 'Kelola seluruh cabang properti kos putri, info fasilitas, dan rekening penerima pembayaran.'
                                : 'Detail cabang properti kos tempat Anda ditugaskan bertugas.'}
                        </p>
                    </div>

                    {isOwner && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Cabang Baru
                        </button>
                    )}
                </div>

                {/* Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {properties.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {p.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-3 w-3" /> {p.address}
                                        </p>
                                    </div>
                                </div>

                                {isOwner && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEdit(p)}
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                            title="Edit Cabang"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p)}
                                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                            title="Hapus Cabang"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {p.description && (
                                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                    {p.description}
                                </p>
                            )}

                            {/* Facilities Chips */}
                            <div>
                                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                    Fasilitas Tersedia:
                                </span>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {(p.facilities || ['AC', 'WiFi', 'CCTV 24 Jam', 'Dapur']).map((f, i) => (
                                        <span
                                            key={i}
                                            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                        >
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Bank Account Info */}
                            {p.bank_account_info && (
                                <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100 dark:bg-zinc-800/40 dark:border-zinc-800 text-xs flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                                        <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>
                                            {p.bank_account_info.bank}: <strong className="font-mono">{p.bank_account_info.account_number}</strong>
                                        </span>
                                    </div>
                                    <span className="text-zinc-500">
                                        a.n. {p.bank_account_info.account_holder}
                                    </span>
                                </div>
                            )}

                            {/* Footer stats */}
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                <span className="flex items-center gap-1.5">
                                    <BedDouble className="h-3.5 w-3.5" />
                                    {p.rooms?.length || 0} Kamar Terdaftar
                                </span>
                                {p.phone_number && (
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Phone className="h-3.5 w-3.5" />
                                        {p.phone_number}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Property Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                    Tambah Cabang Kos Baru
                                </h3>
                                <button
                                    onClick={() => setIsCreateOpen(false)}
                                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Nama Cabang *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Manggon Cabang Dahlia"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Alamat Lengkap *
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={createForm.data.address}
                                        onChange={(e) => createForm.setData('address', e.target.value)}
                                        placeholder="Jl. Dahlia No. 45, Dekat Kampus..."
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Nomor Telepon / WA
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.data.phone_number}
                                            onChange={(e) => createForm.setData('phone_number', e.target.value)}
                                            placeholder="08123456789"
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Fasilitas (Pisahkan Koma)
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.data.facilities_string}
                                            onChange={(e) => createForm.setData('facilities_string', e.target.value)}
                                            placeholder="WiFi, AC, CCTV, Dapur"
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                    <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
                                        Rekening Pembayaran Kos
                                    </span>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Bank (BCA/Mandiri)"
                                            value={createForm.data.bank}
                                            onChange={(e) => createForm.setData('bank', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nomor Rekening"
                                            value={createForm.data.account_number}
                                            onChange={(e) => createForm.setData('account_number', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Atas Nama (a.n)"
                                            value={createForm.data.account_holder}
                                            onChange={(e) => createForm.setData('account_holder', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Simpan Cabang
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Property Modal */}
                {editingProperty && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                    Edit Cabang: {editingProperty.name}
                                </h3>
                                <button
                                    onClick={() => setEditingProperty(null)}
                                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="mt-4 space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Nama Cabang *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Alamat Lengkap *
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={editForm.data.address}
                                        onChange={(e) => editForm.setData('address', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Nomor Telepon / WA
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.data.phone_number}
                                            onChange={(e) => editForm.setData('phone_number', e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Fasilitas (Pisahkan Koma)
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.data.facilities_string}
                                            onChange={(e) => editForm.setData('facilities_string', e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                    <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
                                        Rekening Pembayaran Kos
                                    </span>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Bank"
                                            value={editForm.data.bank}
                                            onChange={(e) => editForm.setData('bank', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="No Rekening"
                                            value={editForm.data.account_number}
                                            onChange={(e) => editForm.setData('account_number', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Atas Nama"
                                            value={editForm.data.account_holder}
                                            onChange={(e) => editForm.setData('account_holder', e.target.value)}
                                            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProperty(null)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Perbarui Cabang
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
