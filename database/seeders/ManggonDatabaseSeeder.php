<?php

namespace Database\Seeders;

use App\Enums\ComplaintStatus;
use App\Enums\PaymentStatus;
use App\Enums\RoomStatus;
use App\Enums\SecurityLogStatus;
use App\Enums\SecurityLogType;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\ComplaintTicket;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Room;
use App\Models\SecurityLog;
use App\Models\TenantProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ManggonDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Properti Cabang
        $melati = Property::create([
            'name' => 'Manggon Cabang Melati (Dukuh Kupang)',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang Barat XX No. 12, Surabaya',
            'phone_number' => '081234567891',
            'description' => 'Kos putri eksklusif, tenang, dekat kampus UWKS Surabaya. Dilengkapi fasilitas modern dan penjagaan 24 jam.',
            'facilities' => [
                'AC Inverter',
                'WiFi High-Speed 100 Mbps',
                'Kamar Mandi Dalam & Water Heater',
                'Dapur Bersama & Kulkas',
                'CCTV 24 Jam',
                'Parkir Motor Aman Berkanopi',
                'Mesin Cuci Bersama',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
            ],
            'bank_account_info' => [
                'bank' => 'BCA',
                'account_number' => '0123456789',
                'account_holder' => 'Manggon Residence Melati',
            ],
            'is_active' => true,
        ]);

        $anggrek = Property::create([
            'name' => 'Manggon Cabang Anggrek (Gubeng)',
            'slug' => 'cabang-anggrek',
            'address' => 'Jl. Gubeng Kertajaya VIII No. 4, Surabaya',
            'phone_number' => '081234567892',
            'description' => 'Kos putri premium dekat Kampus B Unair dan RSUD Dr. Soetomo. Lingkungan asri, sejuk, dan teratur.',
            'facilities' => [
                'AC Dual Inverter',
                'WiFi 150 Mbps',
                'Smart TV',
                'Kamar Mandi Dalam & Water Heater',
                'Dapur Kompor Induksi',
                'CCTV 24 Jam',
                'Akses Pintu Smart Lock Card',
            ],
            'images' => [
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60',
            ],
            'bank_account_info' => [
                'bank' => 'Mandiri',
                'account_number' => '1410098765432',
                'account_holder' => 'Manggon Residence Anggrek',
            ],
            'is_active' => true,
        ]);

        // 2. Kamar untuk Cabang Melati
        $roomsMelati = [];
        $melatiRoomConfigs = [
            ['room_number' => 'A01', 'floor' => 1, 'price' => 1500000, 'status' => RoomStatus::OCCUPIED],
            ['room_number' => 'A02', 'floor' => 1, 'price' => 1500000, 'status' => RoomStatus::OCCUPIED],
            ['room_number' => 'A03', 'floor' => 1, 'price' => 1500000, 'status' => RoomStatus::EMPTY],
            ['room_number' => 'A04', 'floor' => 2, 'price' => 1650000, 'status' => RoomStatus::EMPTY],
            ['room_number' => 'A05', 'floor' => 2, 'price' => 1650000, 'status' => RoomStatus::EMPTY],
            ['room_number' => 'A06', 'floor' => 2, 'price' => 1500000, 'status' => RoomStatus::MAINTENANCE],
        ];

        foreach ($melatiRoomConfigs as $cfg) {
            $roomsMelati[$cfg['room_number']] = Room::create([
                'property_id' => $melati->id,
                'room_number' => $cfg['room_number'],
                'floor' => $cfg['floor'],
                'price' => $cfg['price'],
                'status' => $cfg['status'],
                'facilities' => ['AC', 'WiFi', 'Kasur Springbed', 'Lemari Pakaian', 'Meja Belajar'],
                'description' => "Kamar {$cfg['room_number']} Lantai {$cfg['floor']} dengan pencahayaan alami optimal.",
            ]);
        }

        // Kamar untuk Cabang Anggrek
        $roomsAnggrek = [];
        $anggrekRoomConfigs = [
            ['room_number' => 'B01', 'floor' => 1, 'price' => 1850000, 'status' => RoomStatus::OCCUPIED],
            ['room_number' => 'B02', 'floor' => 1, 'price' => 1850000, 'status' => RoomStatus::EMPTY],
            ['room_number' => 'B03', 'floor' => 1, 'price' => 1850000, 'status' => RoomStatus::EMPTY],
            ['room_number' => 'B04', 'floor' => 2, 'price' => 2100000, 'status' => RoomStatus::EMPTY],
            ['room_number' => 'B05', 'floor' => 2, 'price' => 2100000, 'status' => RoomStatus::EMPTY],
            ['room_number' => 'B06', 'floor' => 2, 'price' => 1850000, 'status' => RoomStatus::EMPTY],
        ];

        foreach ($anggrekRoomConfigs as $cfg) {
            $roomsAnggrek[$cfg['room_number']] = Room::create([
                'property_id' => $anggrek->id,
                'room_number' => $cfg['room_number'],
                'floor' => $cfg['floor'],
                'price' => $cfg['price'],
                'status' => $cfg['status'],
                'facilities' => ['AC', 'WiFi', 'Smart TV', 'Kasur Queen Bed', 'Meja Rias', 'Balkon'],
                'description' => "Kamar {$cfg['room_number']} Lantai {$cfg['floor']} tipe Deluxe Kos.",
            ]);
        }

        // 3. User Pemilik (Owner / Superadmin)
        $owner = User::create([
            'name' => 'Hj. Retno Wulandari',
            'email' => 'owner@manggon.id',
            'username' => 'owner_manggon',
            'phone_number' => '081122334455',
            'password' => Hash::make('password123'),
            'role' => UserRole::OWNER,
            'property_id' => null,
            'is_active' => true,
            'must_change_password' => false,
        ]);

        // 4. User Staf Penjaga
        // Staf Cabang Melati (username: siti7891)
        $staffMelati = User::create([
            'name' => 'Siti Aminah',
            'email' => 'siti@manggon.id',
            'username' => 'siti7891',
            'phone_number' => '081234567891',
            'password' => Hash::make('password123'),
            'role' => UserRole::STAFF,
            'property_id' => $melati->id,
            'is_active' => true,
            'must_change_password' => false,
        ]);

        // Staf Cabang Anggrek (username: dewi7892)
        $staffAnggrek = User::create([
            'name' => 'Dewi Lestari',
            'email' => 'dewi@manggon.id',
            'username' => 'dewi7892',
            'phone_number' => '081234567892',
            'password' => Hash::make('password123'),
            'role' => UserRole::STAFF,
            'property_id' => $anggrek->id,
            'is_active' => true,
            'must_change_password' => false,
        ]);

        // 5. User Anak Kos (Tenants)
        // Tenant 1: Melati A01
        $tenant1 = User::create([
            'name' => 'Putri Ayu Wandira',
            'email' => 'putriayu@gmail.com',
            'username' => 'panda_a01',
            'phone_number' => '085711223344',
            'password' => Hash::make('password123'),
            'role' => UserRole::TENANT,
            'property_id' => $melati->id,
            'is_active' => true,
            'must_change_password' => false,
        ]);

        TenantProfile::create([
            'user_id' => $tenant1->id,
            'room_id' => $roomsMelati['A01']->id,
            'emergency_contact_name' => 'H. Bambang Wandira (Ayah)',
            'emergency_contact_phone' => '081299887766',
            'emergency_contact_relation' => 'Orang Tua',
            'identity_card_number' => '3578012345670001',
            'entry_date' => Carbon::now()->subMonths(3)->toDateString(),
            'notes' => 'Mahasiswi Kedokteran Gigi UWKS',
        ]);

        // Tenant 2: Melati A02 (must_change_password = true)
        $tenant2 = User::create([
            'name' => 'Nabila Shafa Maharani',
            'email' => 'nabila@gmail.com',
            'username' => 'ceri_a02',
            'phone_number' => '085755667788',
            'password' => Hash::make('password123'),
            'role' => UserRole::TENANT,
            'property_id' => $melati->id,
            'is_active' => true,
            'must_change_password' => true, // Demo force change password
        ]);

        TenantProfile::create([
            'user_id' => $tenant2->id,
            'room_id' => $roomsMelati['A02']->id,
            'emergency_contact_name' => 'Nurul Hidayati (Ibu)',
            'emergency_contact_phone' => '081344556677',
            'emergency_contact_relation' => 'Orang Tua',
            'identity_card_number' => '3578012345670002',
            'entry_date' => Carbon::now()->subDays(10)->toDateString(),
            'notes' => 'Pekerja Kantor BUMN Surabaya',
        ]);

        // Tenant 3: Anggrek B01
        $tenant3 = User::create([
            'name' => 'Zahra Amelia',
            'email' => 'zahra@gmail.com',
            'username' => 'mangga_b01',
            'phone_number' => '085799001122',
            'password' => Hash::make('password123'),
            'role' => UserRole::TENANT,
            'property_id' => $anggrek->id,
            'is_active' => true,
            'must_change_password' => false,
        ]);

        TenantProfile::create([
            'user_id' => $tenant3->id,
            'room_id' => $roomsAnggrek['B01']->id,
            'emergency_contact_name' => 'Irawan Saputra (Kakak)',
            'emergency_contact_phone' => '081277665544',
            'emergency_contact_relation' => 'Kakak Kandung',
            'identity_card_number' => '3578012345670003',
            'entry_date' => Carbon::now()->subMonths(1)->toDateString(),
            'notes' => 'Mahasiswi Farmasi UNAIR',
        ]);

        // 6. Transaksi Pembayaran (Payments)
        // 6.1 Lunas & diverifikasi staf Siti Aminah
        Payment::create([
            'invoice_number' => 'INV-202609-001',
            'tenant_id' => $tenant1->id,
            'property_id' => $melati->id,
            'room_id' => $roomsMelati['A01']->id,
            'billing_period' => 'September 2026',
            'amount' => 1500000,
            'proof_image' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
            'status' => PaymentStatus::PAID,
            'payment_date' => Carbon::now()->subDays(2),
            'verified_by' => $staffMelati->id,
            'verified_at' => Carbon::now()->subDays(1),
            'notes' => 'Transfer via BCA m-banking, sudah dicocokkan mutasi.',
        ]);

        // 6.2 Menunggu verifikasi (Pending Verification)
        Payment::create([
            'invoice_number' => 'INV-202609-002',
            'tenant_id' => $tenant3->id,
            'property_id' => $anggrek->id,
            'room_id' => $roomsAnggrek['B01']->id,
            'billing_period' => 'September 2026',
            'amount' => 1850000,
            'proof_image' => 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=60',
            'status' => PaymentStatus::PENDING_VERIFICATION,
            'payment_date' => Carbon::now()->subHours(4),
            'notes' => 'Bukti transfer diunggah dari Tenant Mobile App.',
        ]);

        // 6.3 Belum dibayar (Unpaid)
        Payment::create([
            'invoice_number' => 'INV-202609-003',
            'tenant_id' => $tenant2->id,
            'property_id' => $melati->id,
            'room_id' => $roomsMelati['A02']->id,
            'billing_period' => 'September 2026',
            'amount' => 1500000,
            'status' => PaymentStatus::UNPAID,
            'notes' => 'Tagihan sewa bulan perdana.',
        ]);

        // 7. Security Logs (Izin Pulang Malam & Tamu)
        // 7.1 Izin Pulang Malam Disetujui
        SecurityLog::create([
            'property_id' => $melati->id,
            'tenant_id' => $tenant1->id,
            'type' => SecurityLogType::LATE_RETURN,
            'date' => Carbon::today()->toDateString(),
            'planned_time' => '23:30',
            'actual_time' => '23:25',
            'notes' => 'Mengerjakan tugas kelompok skripsi di perpustakaan bersama teman kuliah.',
            'status' => SecurityLogStatus::APPROVED,
            'approved_by' => $staffMelati->id,
            'approved_at' => Carbon::now()->subHours(5),
        ]);

        // 7.2 Izin Tamu Wanita Menginap - Menunggu Persetujuan
        SecurityLog::create([
            'property_id' => $anggrek->id,
            'tenant_id' => $tenant3->id,
            'type' => SecurityLogType::GUEST_VISIT,
            'date' => Carbon::tomorrow()->toDateString(),
            'planned_time' => '19:00 - 21:00',
            'guest_name' => 'Rina Salsabila (Sepupu Perempuan)',
            'notes' => 'Kunjungan keluarga dari luar kota (khusus tamu wanita).',
            'status' => SecurityLogStatus::PENDING,
        ]);

        // 8. Complaint Tickets (Tiket Keluhan Fasilitas)
        // 8.1 Sedang dikerjakan
        ComplaintTicket::create([
            'ticket_number' => 'TKT-202609-001',
            'property_id' => $melati->id,
            'room_id' => $roomsMelati['A01']->id,
            'tenant_id' => $tenant1->id,
            'title' => 'Remote AC Tidak Merespons & Kurang Dingin',
            'description' => 'Remote AC tombolnya tidak merespons meski baterai sudah diganti, dan hembusan angin terasa kurang dingin sejak kemarin sore.',
            'photo_evidence' => 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=60',
            'status' => ComplaintStatus::IN_PROGRESS,
            'handled_by' => $staffMelati->id,
            'resolution_notes' => 'Teknisi servis AC dijadwalkan datang hari ini pukul 14.00 WIB.',
        ]);

        // 8.2 Menunggu tindakan
        ComplaintTicket::create([
            'ticket_number' => 'TKT-202609-002',
            'property_id' => $anggrek->id,
            'room_id' => $roomsAnggrek['B01']->id,
            'tenant_id' => $tenant3->id,
            'title' => 'Kran Wastafel Kamar Mandi Menetes',
            'description' => 'Kran air wastafel menetes perlahan saat ditutup rapat, butuh penggantian seal karet.',
            'photo_evidence' => null,
            'status' => ComplaintStatus::PENDING,
        ]);

        // 9. Activity Logs (Audit Trail)
        ActivityLog::create([
            'user_id' => $owner->id,
            'property_id' => $melati->id,
            'action' => 'create_bill',
            'description' => 'Pemilik membuat tagihan sewa September 2026 untuk kamar A01 (Putri Ayu).',
            'subject_type' => Payment::class,
            'subject_id' => 1,
            'properties' => ['invoice_number' => 'INV-202609-001', 'amount' => 1500000],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
            'created_at' => Carbon::now()->subDays(2),
        ]);

        ActivityLog::create([
            'user_id' => $staffMelati->id,
            'property_id' => $melati->id,
            'action' => 'verify_payment',
            'description' => 'Staf Siti Aminah memvalidasi pembayaran tagihan INV-202609-001.',
            'subject_type' => Payment::class,
            'subject_id' => 1,
            'properties' => ['status_before' => 'pending_verification', 'status_after' => 'paid'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
            'created_at' => Carbon::now()->subDays(1),
        ]);

        ActivityLog::create([
            'user_id' => $staffMelati->id,
            'property_id' => $melati->id,
            'action' => 'approve_security_log',
            'description' => 'Staf Siti Aminah menyetujui izin pulang malam untuk Putri Ayu.',
            'subject_type' => SecurityLog::class,
            'subject_id' => 1,
            'properties' => ['type' => 'late_return', 'planned_time' => '23:30'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
            'created_at' => Carbon::now()->subHours(5),
        ]);
    }
}
