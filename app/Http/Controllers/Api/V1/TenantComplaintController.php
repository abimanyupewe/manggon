<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ComplaintStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TenantComplaintResource;
use App\Models\ComplaintTicket;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TenantComplaintController extends Controller
{
    /**
     * Tampilkan riwayat dan tiket pengaduan fasilitas kamar anak kos.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $complaints = ComplaintTicket::with(['room', 'handler'])
            ->where('tenant_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => TenantComplaintResource::collection($complaints),
        ]);
    }

    /**
     * Buat tiket keluhan/kerusakan fasilitas kamar baru.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenantProfile.room');

        $room = $user->tenantProfile?->room;

        if (! $room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda belum terhubung dengan kamar aktif untuk mengajukan tiket keluhan.',
            ], 422);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'photo_evidence' => ['nullable'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo_evidence')) {
            $file = $request->file('photo_evidence');
            $storedPath = $file->store('complaints/evidence', 'public');
            $photoPath = '/storage/' . $storedPath;
        } elseif (! empty($validated['photo_evidence'])) {
            $photoPath = (string) $validated['photo_evidence'];
        }

        // Generate unique ticket number: TKT-YYYYMM-XXXX
        $ticketCount = ComplaintTicket::whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))
            ->count() + 1;
        $ticketNumber = sprintf('TKT-%s-%03d', date('Ym'), $ticketCount);

        // Jika nomor tiket sudah ada secara kebetulan, tambahkan random suffix
        if (ComplaintTicket::where('ticket_number', $ticketNumber)->exists()) {
            $ticketNumber .= '-' . strtoupper(Str::random(3));
        }

        $complaint = ComplaintTicket::create([
            'ticket_number' => $ticketNumber,
            'property_id' => $room->property_id,
            'room_id' => $room->id,
            'tenant_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'photo_evidence' => $photoPath,
            'status' => ComplaintStatus::PENDING,
        ]);

        ActivityLogger::log(
            action: 'tenant_create_complaint',
            description: "Anak kos {$user->name} melaporkan masalah kamar ({$room->room_number}): {$complaint->title} [{$ticketNumber}].",
            subject: $complaint
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan keluhan fasilitas berhasil diajukan.',
            'data' => new TenantComplaintResource($complaint->load(['room', 'handler'])),
        ], 201);
    }
}
