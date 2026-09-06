<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ComplaintTicketController;
use App\Http\Controllers\PaymentManagementController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SecurityLogController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'password.changed'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Rute bersama Owner & Staf (dengan Policy Data Scoping cabang)
    Route::middleware('role:owner,staff')->group(function () {
        // Properti
        Route::get('properties', [PropertyController::class, 'index'])->name('properties.index');
        Route::get('properties/{property}', [PropertyController::class, 'show'])->name('properties.show');

        // Kamar
        Route::get('rooms', [RoomController::class, 'index'])->name('rooms.index');
        Route::patch('rooms/{room}/status', [RoomController::class, 'updateStatus'])->name('rooms.update-status');

        // Tagihan & Pembayaran
        Route::get('payments', [PaymentManagementController::class, 'index'])->name('payments.index');
        Route::post('payments/{payment}/verify', [PaymentManagementController::class, 'verify'])->name('payments.verify');
        Route::post('payments/{payment}/reject', [PaymentManagementController::class, 'reject'])->name('payments.reject');

        // Buku Tamu & Izin Malam
        Route::get('security-logs', [SecurityLogController::class, 'index'])->name('security-logs.index');
        Route::post('security-logs/{securityLog}/approve', [SecurityLogController::class, 'approve'])->name('security-logs.approve');
        Route::post('security-logs/{securityLog}/reject', [SecurityLogController::class, 'reject'])->name('security-logs.reject');

        // Tiket Keluhan
        Route::get('complaints', [ComplaintTicketController::class, 'index'])->name('complaints.index');
        Route::patch('complaints/{complaintTicket}/status', [ComplaintTicketController::class, 'updateStatus'])->name('complaints.update-status');

        // Pengguna
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
    });

    // Rute Mutlak Pemilik (Owner Only)
    Route::middleware('role:owner')->group(function () {
        // Properti CRUD
        Route::post('properties', [PropertyController::class, 'store'])->name('properties.store');
        Route::put('properties/{property}', [PropertyController::class, 'update'])->name('properties.update');
        Route::delete('properties/{property}', [PropertyController::class, 'destroy'])->name('properties.destroy');

        // Kamar CRUD
        Route::post('rooms', [RoomController::class, 'store'])->name('rooms.store');
        Route::put('rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
        Route::delete('rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

        // Pembuatan Akun & Kredensial Otomatis
        Route::post('users/generate-staff', [UserManagementController::class, 'generateStaff'])->name('users.generate-staff');
        Route::post('users/generate-tenant', [UserManagementController::class, 'generateTenant'])->name('users.generate-tenant');

        // Kontrol Finansial Mutlak
        Route::post('payments', [PaymentManagementController::class, 'store'])->name('payments.store');
        Route::delete('payments/{payment}', [PaymentManagementController::class, 'destroy'])->name('payments.destroy');

        // Audit Trail Monitoring
        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
