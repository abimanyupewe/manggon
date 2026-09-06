<?php

use App\Http\Controllers\Api\V1\TenantAuthController;
use App\Http\Controllers\Api\V1\TenantBillController;
use App\Http\Controllers\Api\V1\TenantComplaintController;
use App\Http\Controllers\Api\V1\TenantProfileController;
use App\Http\Controllers\Api\V1\TenantSecurityLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Manggon Mobile (Tenant Platform)
|--------------------------------------------------------------------------
|
| Stateless REST API dengan autentikasi Bearer Token Laravel Sanctum.
| Dikhususkan untuk aplikasi mobile anak kos putri.
|
*/

Route::prefix('v1')->name('api.v1.')->group(function () {
    // 1. Autentikasi Publik Mobile
    Route::post('/auth/login', [TenantAuthController::class, 'login'])->name('auth.login');

    // 2. Autentikasi Terproteksi Sanctum (Dapat diakses saat must_change_password)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/change-password', [TenantAuthController::class, 'changePassword'])->name('auth.change-password');
        Route::post('/auth/logout', [TenantAuthController::class, 'logout'])->name('auth.logout');
    });

    // 3. Rute Operasional Anak Kos (Wajib Bearer Token, Role Tenant, & Password Sudah Diubah)
    Route::middleware(['auth:sanctum', 'role:tenant', 'password.changed'])->prefix('tenant')->name('tenant.')->group(function () {
        // Profil & Kontak Darurat
        Route::get('/profile', [TenantProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [TenantProfileController::class, 'update'])->name('profile.update');

        // Pembayaran Sewa & Bukti Transfer
        Route::get('/bills', [TenantBillController::class, 'index'])->name('bills.index');
        Route::get('/bills/{payment}', [TenantBillController::class, 'show'])->name('bills.show');
        Route::post('/bills/{payment}/upload-proof', [TenantBillController::class, 'uploadProof'])->name('bills.upload-proof');

        // Satpam Digital (Izin Pulang Malam & Tamu Wanita)
        Route::get('/security-logs', [TenantSecurityLogController::class, 'index'])->name('security-logs.index');
        Route::post('/security-logs', [TenantSecurityLogController::class, 'store'])->name('security-logs.store');

        // Aduan / Komplain Fasilitas Kamar
        Route::get('/complaints', [TenantComplaintController::class, 'index'])->name('complaints.index');
        Route::post('/complaints', [TenantComplaintController::class, 'store'])->name('complaints.store');
    });
});
