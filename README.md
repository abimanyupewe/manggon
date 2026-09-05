# Manggon

**Manajemen Kos Putri Multi-Lokasi, Aman, dan Transparan.**

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Inertia.js](https://img.shields.io/badge/Inertia.js-v2-9553E9?style=for-the-badge&logo=inertia&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pest PHP](https://img.shields.io/badge/Pest_PHP-3.8-5B4638?style=for-the-badge&logo=pestphp&logoColor=white)

---

## Masalah

Manajemen kos putri multi-lokasi menghadapi beberapa tantangan kritis:

1. **Pencatatan Keuangan Manual** - Pemilik kos masih menggunakan catatan manual (buku/tulisan tangan) yang rawan kesalahan dan fraud. Tidak ada jejak audit yang jelas.

2. **Respon Lambat terhadap Keluhan** - Ketika fasilitas rusak (AC, kran air, dll), anak kos harus melapor secara langsung. Proses pelaporan dan penanganan tidak terstruktur.

3. **Sistem Keamanan Tidak Terintegrasi** - Pengelolaan jam malam dan buku tamu masih konvensional. Tidak ada cara efektif untuk memantau aktivitas masuk/keluar penghuni.

4. **Koordinasi Sulit antar Stakeholder** - Pemilik, staf penjaga, dan anak kos kesulitan berkomunikasi secara efisien. Informasi tersebar di berbagai platform (WhatsApp, telepon, dll).

5. **Tidak Ada Transparansi Data** - Pemilik kesulitan memantau performa keuangan semua cabang secara real-time. Staf tidak memiliki dashboard untuk mengelola tugas harian.

---

## Solusi

Manggon adalah platform manajemen properti terintegrasi yang dirancang khusus untuk operasional kos putri dengan banyak cabang (multi-lokasi).

### Fitur Utama

#### Untuk Pemilik (Owner / Superadmin)
- **Dashboard Multi-Cabang** - Pantau performa keuangan semua cabang dalam satu tampilan
- **Manajemen Kredensial** - Buat akun staf dan anak kos otomatis dengan format username yang konsisten
- **Audit Trail** - Rekam jejak aktivitas semua pengguna untuk mencegah fraud
- **Kontrol Finansial** - Hanya pemilik yang dapat membuat tagihan, edit nominal, atau hapus pembayaran

#### Untuk Staf (Branch Admin / Penjaga Kos)
- **Data Scoping** - Staf hanya melihat data dari cabang tempat ia ditugaskan
- **Action Center** - Dasbor fokus pada tindakan: validasi pembayaran, tiket keluhan, permintaan izin malam
- **Restricted CRUD** - Staf tidak bisa menambah anak kos, edit nominal uang, atau hapus tagihan

#### Untuk Anak Kos (Tenant)
- **Force Password Change** - Wajib mengubah kata sandi acak saat login pertama kali
- **Satpam Digital** - Laporkan izin pulang malam dan tamu yang menginap
- **Pembayaran Mandiri** - Unggah foto bukti transfer langsung dari kamera/galeri
- **Sistem Tiket Keluhan** - Laporkan kerusakan fasilitas dengan pelacakan status perbaikan

---

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Laravel | 12 | Backend Framework (API-First + Inertia Provider) |
| PHP | 8.2+ | Bahasa Backend |
| React | 19 | Frontend Library |
| Inertia.js | 2.0 | Bridge antara Laravel & React |
| TypeScript | 5.7 | Type Safety |
| Tailwind CSS | v4 | Utility-First CSS Framework |
| Radix UI | - | Headless UI Components |
| Vite | 6 | Build Tool & Dev Server |
| PostgreSQL | 16 | Database (atau MySQL) |
| Pest PHP | 3.8 | Testing Framework |
| Laravel Sanctum | - | API Token Authentication |
| ESLint | 9 | Code Linter |
| Prettier | 3.4 | Code Formatter |

---

## Instalasi

### Prasyarat

- PHP 8.2 atau lebih tinggi
- Node.js 18 atau lebih tinggi
- Composer
- PostgreSQL atau MySQL

### Langkah-langkah

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/manggon.git
   cd manggon
   ```

2. **Install Dependencies PHP**
   ```bash
   composer install
   ```

3. **Install Dependencies Node.js**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Konfigurasi Database**
   
   Edit file `.env` dan sesuaikan konfigurasi database:
   ```
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=manggon
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

6. **Jalankan Migrasi**
   ```bash
   php artisan migrate
   ```

7. **Jalankan Development Server**
   
   Untuk menjalankan semua service sekaligus:
   ```bash
   composer dev
   ```
   
   Atau jalankan manual secara terpisah:
   ```bash
   php artisan serve
   npm run dev
   ```

8. **Akses Aplikasi**
   
   Buka browser dan akses: `http://localhost:8000`

---

## Struktur Proyek

```
manggon/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Controller endpoints
│   │   ├── Middleware/       # Middleware authentication & authorization
│   │   └── Requests/        # Form request validation
│   ├── Models/              # Eloquent models
│   └── Providers/           # Service providers
├── bootstrap/
├── config/
├── database/
│   ├── factories/           # Model factories untuk testing
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── dev/
│   ├── PRD.md               # Product Requirements Document
│   └── SDD.md               # Software Design Document
├── public/
├── resources/
│   ├── css/                 # CSS files
│   ├── js/
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/         # Layout components
│   │   ├── pages/           # Page components (Inertia)
│   │   └── types/           # TypeScript type definitions
│   └── views/               # Blade templates
├── routes/
│   ├── web.php              # Web routes (Inertia)
│   ├── api.php              # API routes (Mobile App)
│   └── auth.php             # Authentication routes
├── storage/
├── tests/
│   ├── Feature/             # Feature tests
│   └── Unit/                # Unit tests
├── .env.example
├── composer.json
├── package.json
├── vite.config.js
└── tsconfig.json
```

---

## Arsitektur

### Backend (Laravel)
- **API-First Approach** - Semua fitur tersedia melalui API RESTful
- **Inertia Provider** - Untuk integrasi seamless dengan React frontend
- **RBAC via Laravel Policies** - Role-Based Access Control untuk Owner, Staff, Tenant
- **Sanctum Authentication** - Untuk mobile app (React Native)

### Frontend (React + Inertia)
- **Clean Architecture** - Pemisahan Layer Domain, UI Components, dan Pages
- **TypeScript Strict Mode** - Dilarang menggunakan tipe `any`
- **Component Isolation** - Komponen UI bersifat presentasional, logika di level Pages

### Mobile (React Native)
- **REST API Integration** - Berinteraksi dengan Laravel melalui Sanctum
- **Offline-First Consideration** - Dukungan untuk kondisi jaringan tidak stabil

---

## Role-Based Access Control

| Aksi | Owner | Staff | Tenant |
|------|-------|-------|--------|
| Create/Delete Anak Kos | ✅ | ❌ | ❌ |
| Create/Edit/Delete Tagihan | ✅ | ❌ | ❌ |
| Create/Edit/Delete Kamar | ✅ | ❌ | ❌ |
| Validasi Pembayaran | ✅ | ✅* | ❌ |
| Update Status Keluhan | ✅ | ✅* | ❌ |
| Izin Malam/Tamu | ❌ | ✅* | ✅ |
| Upload Bukti Bayar | ❌ | ❌ | ✅ |
| Lapor Keluhan | ❌ | ❌ | ✅ |

*\* Staf hanya dapat mengakses data dari cabang tempat ia ditugaskan*

---

## Generator Kredensial

### Format Username Staf
```
Nama Depan + 4 Digit Terakhir Telepon (huruf kecil semua)
Contoh: Budi Santoso (081234567890) → budi7890
```

### Format Username Anak Kos
```
Dictionary (hewan/buah) + ID/Nomor Kamar (huruf kecil semua)
Contoh: Ayu (Kamar A01) → panda_a01 atau ceri_a01
```

### Force Password Change
Semua pengguna baru akan menerima kata sandi acak dari sistem. Saat login pertama kali, pengguna **wajib** mengubah kata sandi sebelum dapat mengakses dashboard.

---

## API Routes

### Web Routes (`routes/web.php`)
- Landing Page (publik)
- Web Dashboard (Owner & Staff)
- Dilindungi middleware auth dan role

### API Routes (`routes/api.php`)
- Mobile App (Tenant)
- Response JSON murni (API Resources)
- Dilindungi middleware auth:sanctum

---

## Testing

Jalankan semua testing:
```bash
php artisan test
```

Jalankan testing dengan Pest:
```bash
vendor/bin/pest
```

Jalankan testing dengan coverage:
```bash
vendor/bin/pest --coverage
```

---

## Code Quality

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### PHP Code Style
```bash
./vendor/bin/pint
```

---

## License

MIT License

Copyright (c) 2026 Manggon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
