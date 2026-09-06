<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Http\Requests\StorePaymentBillRequest;
use App\Models\Payment;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentManagementController extends Controller
{
    /**
     * Tampilkan daftar transaksi pembayaran sewa.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = $request->user();
        $query = Payment::with(['tenant.tenantProfile.room', 'property', 'room', 'verifier']);

        if ($user->isStaff()) {
            $query->where('property_id', $user->property_id);
        } elseif ($request->filled('property_id')) {
            $query->where('property_id', $request->input('property_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $payments = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $payments,
            ]);
        }

        $tenants = \App\Models\User::with(['tenantProfile.room', 'property'])
            ->where('role', \App\Enums\UserRole::TENANT)
            ->whereHas('tenantProfile', function ($q) {
                $q->whereNotNull('room_id');
            })->get();

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'properties' => \App\Models\Property::all(),
            'tenants' => $tenants,
        ]);
    }

    /**
     * Kontrol Finansial Mutlak: Buat tagihan sewa bulanan baru (Owner only).
     */
    public function store(StorePaymentBillRequest $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();
        $tenant = User::with('tenantProfile.room')->findOrFail($validated['tenant_id']);

        if (! $tenant->tenantProfile || ! $tenant->tenantProfile->room) {
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tenant belum ditempatkan pada kamar manapun.',
                ], 422);
            }
            return redirect()->back()->withErrors(['tenant_id' => 'Tenant belum memiliki kamar aktif.']);
        }

        $propertyId = $tenant->property_id ?? $tenant->tenantProfile->room->property_id;
        $roomId = $tenant->tenantProfile->room_id;

        $invoiceNumber = 'INV-' . date('Ym') . '-' . strtoupper(Str::random(4));

        $payment = Payment::create([
            'invoice_number' => $invoiceNumber,
            'tenant_id' => $tenant->id,
            'property_id' => $propertyId,
            'room_id' => $roomId,
            'billing_period' => $validated['billing_period'],
            'amount' => $validated['amount'],
            'status' => PaymentStatus::UNPAID,
            'notes' => $validated['notes'] ?? null,
        ]);

        ActivityLogger::log(
            action: 'create_bill',
            description: "Pemilik membuat tagihan sewa {$payment->invoice_number} sebesar Rp " . number_format((float) $payment->amount, 0, ',', '.') . " untuk {$tenant->name}.",
            subject: $payment
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Tagihan sewa berhasil diterbitkan.',
                'data' => $payment->load(['tenant', 'room', 'property']),
            ], 201);
        }

        return redirect()->back()->with('success', 'Tagihan sewa berhasil diterbitkan.');
    }

    /**
     * Validasi pembayaran bukti transfer (Staf cabang terkait atau Pemilik).
     */
    public function verify(Request $request, Payment $payment): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->isStaff() && $user->property_id !== $payment->property_id) {
            abort(403, 'Anda tidak memiliki wewenang memvalidasi pembayaran cabang lain.');
        }

        $payment->update([
            'status' => PaymentStatus::PAID,
            'verified_by' => $user->id,
            'verified_at' => now(),
            'notes' => $request->input('notes', $payment->notes),
        ]);

        ActivityLogger::log(
            action: 'verify_payment',
            description: "Staf/Pemilik ({$user->name}) memvalidasi lunas pembayaran tagihan {$payment->invoice_number}.",
            subject: $payment
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Pembayaran berhasil diverifikasi dan disetujui.',
                'data' => $payment,
            ]);
        }

        return redirect()->back()->with('success', 'Pembayaran berhasil diverifikasi.');
    }

    /**
     * Tolak bukti transfer pembayaran yang tidak sah (Staf cabang terkait atau Pemilik).
     */
    public function reject(Request $request, Payment $payment): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->isStaff() && $user->property_id !== $payment->property_id) {
            abort(403, 'Anda tidak memiliki wewenang menolak pembayaran cabang lain.');
        }

        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $payment->update([
            'status' => PaymentStatus::REJECTED,
            'rejection_reason' => $request->input('rejection_reason'),
            'verified_by' => $user->id,
            'verified_at' => now(),
        ]);

        ActivityLogger::log(
            action: 'reject_payment',
            description: "Menolak bukti pembayaran {$payment->invoice_number}. Alasan: {$request->input('rejection_reason')}",
            subject: $payment
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Bukti transfer pembayaran ditolak.',
                'data' => $payment,
            ]);
        }

        return redirect()->back()->with('success', 'Bukti transfer pembayaran ditolak.');
    }

    /**
     * Kontrol Finansial Mutlak: Hapus data tagihan (Owner only).
     */
    public function destroy(Request $request, Payment $payment): JsonResponse|RedirectResponse
    {
        if (! $request->user()->isOwner()) {
            abort(403, 'Hanya Pemilik yang berhak menghapus data transaksi.');
        }

        $invoice = $payment->invoice_number;
        $payment->delete();

        ActivityLogger::log(
            action: 'delete_bill',
            description: "Pemilik menghapus data tagihan sewa {$invoice}."
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => "Tagihan sewa {$invoice} berhasil dihapus.",
            ]);
        }

        return redirect()->back()->with('success', "Tagihan sewa {$invoice} berhasil dihapus.");
    }
}
