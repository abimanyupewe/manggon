<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TenantUserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantProfileController extends Controller
{
    /**
     * Tampilkan profil dan informasi kamar anak kos.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load(['tenantProfile.room.property', 'property']);

        return response()->json([
            'status' => 'success',
            'data' => new TenantUserResource($user),
        ]);
    }

    /**
     * Perbarui nomor HP dan kontak darurat anak kos.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone_number' => ['nullable', 'string', 'max:20'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_relation' => ['nullable', 'string', 'max:100'],
        ]);

        if (isset($validated['phone_number'])) {
            $user->update(['phone_number' => $validated['phone_number']]);
        }

        if ($user->tenantProfile) {
            $user->tenantProfile->update([
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? $user->tenantProfile->emergency_contact_name,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? $user->tenantProfile->emergency_contact_phone,
                'emergency_contact_relation' => $validated['emergency_contact_relation'] ?? $user->tenantProfile->emergency_contact_relation,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profil kontak berhasil diperbarui.',
            'data' => new TenantUserResource($user->load(['tenantProfile.room.property', 'property'])),
        ]);
    }
}
