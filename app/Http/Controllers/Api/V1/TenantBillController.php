<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TenantBillResource;
use App\Models\Payment;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantBillController extends Controller
{
    /**
     * Tampilkan riwayat dan daftar tagihan sewa anak kos.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $bills = Payment::with(['property', 'room'])
            ->where('tenant_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => TenantBillResource::collection($bills),
        ]);
    }

    /**
     * Tampilkan detail tagihan dan rekening pembayaran.
     */
    public function show(Request $request, Payment $payment): JsonResponse
    {
        if ($payment->tenant_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke tagihan ini.',
            ], 403);
        }

        $payment->load(['property', 'room']);

        return response()->json([
            'status' => 'success',
            'data' => new TenantBillResource($payment),
        ]);
    }

    /**
     * Unggah bukti transfer sewa mandiri dari kamera/galeri.
     */
    public function uploadProof(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();

        if ($payment->tenant_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke tagihan ini.',
            ], 403);
        }

        $request->validate([
            'proof_image' => ['required'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $proofPath = null;

        // Tangani unggahan berkas file gambar atau URL string
        if ($request->hasFile('proof_image')) {
            $file = $request->file('proof_image');
            $proofPath = $file->store('payments/proofs', 'public');
            $proofPath = '/storage/' . $proofPath;
        } else {
            $proofPath = (string) $request->input('proof_image');
        }

        $payment->update([
            'proof_image' => $proofPath,
            'status' => PaymentStatus::PENDING_VERIFICATION,
            'payment_date' => now(),
            'notes' => $request->input('notes', $payment->notes),
            'rejection_reason' => null, // Reset alasan penolakan jika unggah ulang
        ]);

        ActivityLogger::log(
            action: 'tenant_upload_proof',
            description: "Anak kos {$user->name} mengunggah bukti pembayaran untuk tagihan {$payment->invoice_number}.",
            subject: $payment
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Bukti transfer berhasil diunggah. Menunggu verifikasi staf.',
            'data' => new TenantBillResource($payment->load(['property', 'room'])),
        ]);
    }
}
