<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\SecurityLogStatus;
use App\Enums\SecurityLogType;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TenantSecurityLogResource;
use App\Models\SecurityLog;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class TenantSecurityLogController extends Controller
{
    /**
     * Tampilkan riwayat perizinan Satpam Digital (pulang malam & tamu wanita) milik anak kos.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = SecurityLog::with(['approver'])
            ->where('tenant_id', $user->id);

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $logs = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => TenantSecurityLogResource::collection($logs),
        ]);
    }

    /**
     * Ajukan formulir perizinan baru (Satpam Digital).
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $propertyId = $user->tenantProfile?->room?->property_id ?? $user->property_id;

        if (! $propertyId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda belum terdaftar di kamar atau cabang kos aktif.',
            ], 422);
        }

        $validated = $request->validate([
            'type' => ['required', new Enum(SecurityLogType::class)],
            'date' => ['required', 'date'],
            'planned_time' => ['required', 'string', 'max:50'],
            'guest_name' => ['nullable', 'string', 'max:255', 'required_if:type,' . SecurityLogType::GUEST_VISIT->value],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $log = SecurityLog::create([
            'property_id' => $propertyId,
            'tenant_id' => $user->id,
            'type' => $validated['type'],
            'date' => $validated['date'],
            'planned_time' => $validated['planned_time'],
            'guest_name' => $validated['guest_name'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => SecurityLogStatus::PENDING,
        ]);

        $typeName = SecurityLogType::tryFrom($validated['type'])?->label() ?? $validated['type'];

        ActivityLogger::log(
            action: 'tenant_create_security_log',
            description: "Anak kos {$user->name} mengajukan izin {$typeName} untuk tanggal {$validated['date']}.",
            subject: $log
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan izin Satpam Digital berhasil dikirimkan.',
            'data' => new TenantSecurityLogResource($log),
        ], 201);
    }
}
