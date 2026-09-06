import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Property, Room, RoomStatus, SharedData } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import {
    BedDouble,
    Plus,
    Building2,
    Filter,
    CheckCircle2,
    X,
    User,
    DollarSign,
    Layers,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Manajemen Kamar',
        href: '/rooms',
    },
];

interface RoomsIndexProps {
    rooms: (Room & {
        property?: Property;
        current_tenant?: {
            user?: {
                id: number;
                name: string;
                username: string;
                phone_number?: string;
            };
        };
    })[];
    properties?: Property[];
}

export default function RoomsIndex({ rooms = [], properties = [] }: RoomsIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const isOwner = auth.user.role === 'owner';
    const isStaff = auth.user.role === 'staff';

    const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create Room Form
    const createForm = useForm({
        property_id: properties.length > 0 ? String(properties[0].id) : '',
        room_number: '',
        floor: 1,
        price: 1500000,
        status: 'empty' as RoomStatus,
        facilities_string: 'AC, WiFi, Spring Bed, Meja Belajar, Lemari',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const facilities = createForm.data.facilities_string
            ? createForm.data.facilities_string.split(',').map((f) => f.trim()).filter(Boolean)
            : [];

        createForm.transform((data) => ({
            property_id: Number(data.property_id),
            room_number: data.room_number,
            floor: Number(data.floor),
            price: Number(data.price),
            status: data.status,
            facilities,
        }));

        createForm.post('/rooms', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleQuickStatusChange = (roomId: number, newStatus: RoomStatus) => {
        router.patch(`/rooms/${roomId}/status`, {
            status: newStatus,
        });
    };

    // Filter rooms
    const filteredRooms = rooms.filter((r) => {
        if (selectedPropertyFilter !== 'all' && String(r.property_id) !== selectedPropertyFilter) {
            return false;
        }
        if (selectedStatusFilter !== 'all' && r.status !== selectedStatusFilter) {
            return false;
        }
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Kamar Kos" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Manajemen Kamar
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {isOwner
                                ? 'Monitoring ketersediaan kamar, penyesuaian tarif sewa, dan denah unit seluruh cabang.'
                                : 'Perbarui status ketersediaan kamar secara langsung saat anak kos check-in atau selesai perbaikan.'}
                        </p>
                    </div>

                    {isOwner && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kamar Baru
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-zinc-500">
                            <Filter className="h-3.5 w-3.5" /> Filter:
                        </span>

                        {isOwner && properties.length > 0 && (
                            <select
                                value={selectedPropertyFilter}
                                onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                                className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <option value="all">Semua Cabang Properti</option>
                                {properties.map((p) => (
                                    <option key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <select
                            value={selectedStatusFilter}
                            onChange={(e) => setSelectedStatusFilter(e.target.value)}
                            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        >
                            <option value="all">Semua Status Kamar</option>
                            <option value="empty">Kosong / Siap Huni</option>
                            <option value="occupied">Terisi</option>
                            <option value="maintenance">Dalam Perbaikan</option>
                        </select>
                    </div>

                    <div className="text-zinc-500">
                        Menampilkan <strong>{filteredRooms.length}</strong> unit kamar
                    </div>
                </div>

                {/* Rooms Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredRooms.map((room) => (
                        <div
                            key={room.id}
                            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold font-mono text-sm">
                                        {room.room_number}
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-400">
                                            {room.property?.name || 'Cabang Kos'}
                                        </div>
                                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                            Lantai {room.floor}
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={room.status} />
                            </div>

                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Tarif Bulanan:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        Rp {Number(room.price).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                {room.current_tenant?.user ? (
                                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-300 pt-1">
                                        <span className="text-zinc-400">Penghuni:</span>
                                        <span className="font-semibold flex items-center gap-1">
                                            <User className="h-3 w-3 text-emerald-600" />
                                            {room.current_tenant.user.name}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-zinc-400 italic text-[11px]">
                                        Kamar belum ada penghuni aktif
                                    </div>
                                )}
                            </div>

                            {/* Quick status switch buttons */}
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">
                                    Ubah Status Cepat:
                                </span>
                                <div className="grid grid-cols-3 gap-1">
                                    <button
                                        onClick={() => handleQuickStatusChange(room.id, 'empty')}
                                        disabled={room.status === 'empty'}
                                        className={`py-1 text-[11px] rounded-lg font-medium transition cursor-pointer ${
                                            room.status === 'empty'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}
                                    >
                                        Kosong
                                    </button>
                                    <button
                                        onClick={() => handleQuickStatusChange(room.id, 'occupied')}
                                        disabled={room.status === 'occupied'}
                                        className={`py-1 text-[11px] rounded-lg font-medium transition cursor-pointer ${
                                            room.status === 'occupied'
                                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold'
                                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}
                                    >
                                        Terisi
                                    </button>
                                    <button
                                        onClick={() => handleQuickStatusChange(room.id, 'maintenance')}
                                        disabled={room.status === 'maintenance'}
                                        className={`py-1 text-[11px] rounded-lg font-medium transition cursor-pointer ${
                                            room.status === 'maintenance'
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}
                                    >
                                        Perbaikan
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Room Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                                    Tambah Kamar Kos Baru
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
                                        Cabang Properti *
                                    </label>
                                    <select
                                        value={createForm.data.property_id}
                                        onChange={(e) => createForm.setData('property_id', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    >
                                        {properties.map((p) => (
                                            <option key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Nomor Kamar *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.data.room_number}
                                            onChange={(e) => createForm.setData('room_number', e.target.value)}
                                            placeholder="Contoh: 105"
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                            Lantai Ke-
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={createForm.data.floor}
                                            onChange={(e) => createForm.setData('floor', Number(e.target.value))}
                                            className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Tarif Sewa Bulanan (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={100000}
                                        step={50000}
                                        value={createForm.data.price}
                                        onChange={(e) => createForm.setData('price', Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                                        Fasilitas Kamar
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.facilities_string}
                                        onChange={(e) => createForm.setData('facilities_string', e.target.value)}
                                        placeholder="AC, WiFi, Spring Bed"
                                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                                    />
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
                                        Simpan Kamar
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
