import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    ShieldCheck,
    Wifi,
    Wind,
    UtensilsCrossed,
    Lock,
    PhoneCall,
    MapPin,
    Building2,
    BedDouble,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    ArrowRight,
    CreditCard,
    Clock,
    UserCheck,
    MessageCircle,
    Star,
    Check,
} from 'lucide-react';
import { Property, SharedData } from '@/types';

interface WelcomeProps {
    properties: (Property & {
        rooms_count: number;
        empty_rooms_count: number;
    })[];
}

export default function Welcome({ properties = [] }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedPropertyId, setSelectedPropertyId] = useState<number>(
        properties.length > 0 ? properties[0].id : 0
    );

    const activeProperty =
        properties.find((p) => p.id === selectedPropertyId) || properties[0];

    const totalRoomsAll = properties.reduce((acc, p) => acc + (p.rooms_count || 0), 0);
    const totalEmptyRoomsAll = properties.reduce((acc, p) => acc + (p.empty_rooms_count || 0), 0);

    const minPrice = activeProperty?.rooms?.length
        ? Math.min(...activeProperty.rooms.map((r) => Number(r.price)))
        : 1200000;

    const waNumber = activeProperty?.phone_number || '6281122334455';
    const waText = encodeURIComponent(
        `Halo Pengelola Manggon, saya tertarik menanyakan ketersediaan kamar di ${activeProperty?.name || 'Kos Putri Manggon'}.`
    );
    const waUrl = `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=${waText}`;

    return (
        <div className="min-h-screen bg-white text-zinc-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
            <Head title="Manggon - Manajemen Kos Putri Multi-Cabang, Aman & Transparan" />

            {/* 1. Header / Navbar (Pure White Mode) */}
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold tracking-tight text-zinc-900">
                                    Manggon
                                </span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                    Khusus Putri
                                </span>
                            </div>
                            <span className="text-[11px] text-zinc-500 hidden sm:block">
                                Safe & Transparent Living
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4 sm:gap-6">
                        <a
                            href="#branches"
                            className="hidden md:inline-flex text-sm font-medium text-zinc-600 hover:text-emerald-600 transition"
                        >
                            Cabang & Kamar
                        </a>
                        <a
                            href="#facilities"
                            className="hidden md:inline-flex text-sm font-medium text-zinc-600 hover:text-emerald-600 transition"
                        >
                            Fasilitas
                        </a>
                        <a
                            href="#security"
                            className="hidden md:inline-flex text-sm font-medium text-zinc-600 hover:text-emerald-600 transition"
                        >
                            Keamanan
                        </a>

                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                            >
                                Dashboard
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition"
                            >
                                Masuk Portal
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* 2. Hero Section (Modern Centered Model - Clean White) */}
            <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-radial from-emerald-50/50 via-white to-white">
                {/* Subtle Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                    {/* Top Centered Pill Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Platform Kos Putri Multi-Cabang Terpadu</span>
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        <span className="text-emerald-700 font-medium">Aman & Terpercaya</span>
                    </div>

                    {/* Main Headline (Centered) */}
                    <h1 className="mt-7 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.12]">
                        Tempat Tinggal Tenang, Aman, dan{' '}
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                            100% Khusus Putri.
                        </span>
                    </h1>

                    {/* Subtitle (Centered) */}
                    <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto leading-relaxed font-normal">
                        Hunian kos modern khusus mahasiswi dan karyawati dengan pengawasan CCTV 24 jam, Satpam Digital terintegrasi, fasilitas kamar full AC, dan transparansi tagihan sewa bulanan langsung di genggaman Anda.
                    </p>

                    {/* Centered Dual CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 hover:bg-emerald-700 active:scale-95 transition"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Tanya Kamar via WhatsApp
                        </a>

                        <a
                            href="#branches"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-7 py-4 text-base font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition"
                        >
                            <BedDouble className="h-5 w-5 text-emerald-600" />
                            Cek Ketersediaan Kamar ({totalEmptyRoomsAll} Kosong)
                        </a>
                    </div>

                    {/* Trust Highlights Badges */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-zinc-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>100% Khusus Mahasiswi & Karyawati</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span>CCTV 24 Jam & Smart Lock Gate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                            <span>Bebas Biaya Admin Tambahan</span>
                        </div>
                    </div>

                    {/* Centered Live Availability Summary Bar */}
                    <div className="mt-16 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl shadow-zinc-200/40 text-left">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900">
                                        Status Ketersediaan Kamar Terkini
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Data real-time disinkronkan langsung dari seluruh cabang kos Manggon
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                    {totalEmptyRoomsAll} Kamar Siap Huni
                                </span>
                                <span className="rounded-xl bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                                    {totalRoomsAll} Total Kamar
                                </span>
                            </div>
                        </div>

                        {/* Branch Quick Switcher in Hero */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                            {properties.map((property) => (
                                <div
                                    key={property.id}
                                    onClick={() => setSelectedPropertyId(property.id)}
                                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                                        selectedPropertyId === property.id
                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                                            : 'border-zinc-200/80 hover:border-zinc-300 bg-zinc-50/40'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-bold text-sm text-zinc-900">
                                                {property.name}
                                            </span>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="h-3 w-3 text-emerald-600" />
                                                {property.address}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                property.empty_rooms_count > 0
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-zinc-200 text-zinc-600'
                                            }`}
                                        >
                                            {property.empty_rooms_count > 0
                                                ? `${property.empty_rooms_count} Kosong`
                                                : 'Penuh'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 pt-2 border-t border-zinc-200/60">
                                        <span>Kapasitas {property.rooms_count} Kamar</span>
                                        <span className="font-semibold text-emerald-700">
                                            Mulai Rp {(1200000).toLocaleString('id-ID')}/bln
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Branch Showcase Section (White Mode) */}
            <section id="branches" className="py-20 bg-zinc-50/60 border-y border-zinc-200/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Lokasi Pilihan
                        </span>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                            Eksplorasi Cabang Kos Manggon
                        </h2>
                        <p className="mt-3 text-base text-zinc-600">
                            Setiap cabang berlokasi strategis di dekat kampus ternama, perkantoran, dan pusat perbelanjaan dengan akses transportasi mudah.
                        </p>
                    </div>

                    {/* Branch Selection Tabs */}
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {properties.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPropertyId(p.id)}
                                className={`rounded-xl px-6 py-3 text-sm font-semibold transition cursor-pointer ${
                                    selectedPropertyId === p.id
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 shadow-xs'
                                }`}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {/* Active Branch Detailed Showcase Card */}
                    {activeProperty && (
                        <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm">
                            <div className="grid gap-10 lg:grid-cols-12 items-center">
                                <div className="lg:col-span-7 space-y-5">
                                    <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Cabang Resmi Manggon
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                                        {activeProperty.name}
                                    </h3>
                                    <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
                                        {activeProperty.description ||
                                            'Hunian eksklusif putri dengan tata ruang asri, sirkulasi udara bersih, dan suasana tenang untuk belajar serta beristirahat.'}
                                    </p>

                                    <div className="space-y-2 text-sm text-zinc-600">
                                        <div className="flex items-center gap-2.5">
                                            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>{activeProperty.address}</span>
                                        </div>
                                        {activeProperty.phone_number && (
                                            <div className="flex items-center gap-2.5">
                                                <PhoneCall className="h-4 w-4 text-emerald-600 shrink-0" />
                                                <span>Kontak Staf Jaga: {activeProperty.phone_number}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Facilities tags */}
                                    <div className="pt-2">
                                        <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                                            Fasilitas Unggulan Cabang Ini:
                                        </span>
                                        <div className="mt-2.5 flex flex-wrap gap-2">
                                            {(activeProperty.facilities || [
                                                'WiFi Super Cepat',
                                                'CCTV 24 Jam',
                                                'Dapur Bersama',
                                                'Kulkas',
                                                'Smart Gate',
                                                'Parkir Motor Luas',
                                            ]).map((f, idx) => (
                                                <span
                                                    key={idx}
                                                    className="rounded-xl bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 border border-zinc-200/60"
                                                >
                                                    ✓ {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 rounded-2xl bg-zinc-50 p-6 sm:p-7 border border-zinc-200 space-y-5">
                                    <div className="flex items-baseline justify-between border-b border-zinc-200 pb-4">
                                        <span className="text-sm font-medium text-zinc-500">Tarif Sewa Kamar</span>
                                        <div className="text-right">
                                            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                                                Rp {minPrice.toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-xs text-zinc-500"> /bulan</span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 border border-zinc-200 space-y-2.5 text-xs">
                                        <div className="flex justify-between text-zinc-600">
                                            <span>Total Kapasitas:</span>
                                            <span className="font-semibold text-zinc-900">{activeProperty.rooms_count} Kamar</span>
                                        </div>
                                        <div className="flex justify-between text-zinc-600">
                                            <span>Ketersediaan Siap Huni:</span>
                                            <span className="font-bold text-emerald-600">
                                                {activeProperty.empty_rooms_count} Kamar Kosong
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-zinc-600">
                                            <span>Sistem Pembayaran:</span>
                                            <span>Transfer Bank & Verifikasi Staf</span>
                                        </div>
                                    </div>

                                    <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Tanya & Booking Cabang Ini
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. Facilities Bento Grid (White Mode) */}
            <section id="facilities" className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Fasilitas Lengkap
                        </span>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                            Standar Kenyamanan Kos Manggon
                        </h2>
                        <p className="mt-3 text-base text-zinc-600">
                            Setiap kamar dan fasilitas penunjang dirancang untuk mendukung fokus belajar, istirahat nyaman, dan produktivitas Anda.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <Wind className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-zinc-900">
                                Kamar Full AC & Furnished
                            </h3>
                            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                                Dilengkapi pendingin ruangan hemat daya, spring bed berkualitas, meja belajar, kursi ergonomis, dan lemari pakaian luas.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <Wifi className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-zinc-900">
                                WiFi Dedicated Super Cepat
                            </h3>
                            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                                Jaringan internet berkecepatan tinggi dengan access point di setiap lorong untuk kelancaran kuliah online dan skripsi.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <UtensilsCrossed className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-zinc-900">
                                Dapur & Kulkas Bersama
                            </h3>
                            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                                Dapur bersih lengkap dengan kompor gas, dispenser air minum higienis gratis, kulkas bersama, dan wastafel cuci piring.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-zinc-900">
                                Satpam Digital & Buku Tamu
                            </h3>
                            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                                Pengawasan izin pulang malam dan tamu wanita via aplikasi mobile, langsung terhubung dan disetujui oleh staf jaga cabang.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-zinc-900">
                                Pembayaran Mandiri Transparan
                            </h3>
                            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                                Pembayaran sewa resmi melalui transfer bank kos, upload bukti bayar mandiri, dan monitoring histori sewa tanpa khawatir fraud.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-zinc-900">
                                Layanan Tanggap Kerusakan
                            </h3>
                            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                                Jika kran bocor atau AC kurang dingin, ajukan tiket keluhan fasilitas melalui aplikasi dan teknisi cabang segera memperbaikinya.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Security & Safety Commitment (White Clean Style) */}
            <section id="security" className="py-20 bg-zinc-50 border-t border-zinc-200/80">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-white border border-zinc-200 p-8 sm:p-12 shadow-md text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 mx-auto">
                            <Lock className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Perlindungan Maksimal Khusus Putri</span>
                        </div>

                        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-zinc-900">
                            Komitmen Lingkungan Aman, Bersih, dan Terjaga
                        </h2>

                        <p className="mt-4 text-zinc-600 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
                            Manggon menerapkan tata tertib ketat: larangan membawa tamu pria ke area kamar, lingkungan bebas asap rokok, pengawasan CCTV terpadu, dan akses pintu pagar digital demi ketenangan orang tua dan kenyamanan Anda.
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Konsultasi & Survey Lokasi
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Footer (Clean White Mode) */}
            <footer className="border-t border-zinc-200 bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-bold text-zinc-900">Manggon</span>
                                <span className="block text-xs text-zinc-500">
                                    Sistem Manajemen Kos Putri Multi-Lokasi
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600">
                            <a href="#branches" className="hover:text-emerald-600 transition">
                                Cabang Kami
                            </a>
                            <a href="#facilities" className="hover:text-emerald-600 transition">
                                Standar Fasilitas
                            </a>
                            <a href="#security" className="hover:text-emerald-600 transition">
                                Keamanan & Aturan
                            </a>
                            <Link href="/login" className="hover:text-emerald-600 font-semibold transition">
                                Portal Staf & Pemilik
                            </Link>
                        </div>

                        <p className="text-xs text-zinc-400">
                            &copy; {new Date().getFullYear()} Manggon. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
