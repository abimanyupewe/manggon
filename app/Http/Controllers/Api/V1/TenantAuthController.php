<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TenantUserResource;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class TenantAuthController extends Controller
{
    /**
     * Autentikasi anak kos putri via REST API (Sanctum Bearer Token).
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $loginInput = strtolower(trim($validated['email']));
        $fieldType = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($fieldType, $loginInput)->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Username/email atau kata sandi tidak valid.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi pemilik kos.',
            ], 403);
        }

        if (! $user->isTenant()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aplikasi mobile ini dikhususkan untuk Anak Kos Putri. Pemilik dan staf dipersilakan mengakses Web Dashboard.',
            ], 403);
        }

        $deviceName = $validated['device_name'] ?? 'Tenant Mobile App';

        // Deteksi first-login password change
        if ($user->must_change_password) {
            $tempToken = $user->createToken('temp-change-password-token')->plainTextToken;

            return response()->json([
                'status' => 'error',
                'code' => 'MUST_CHANGE_PASSWORD',
                'message' => 'Anda masih menggunakan kata sandi acak dari sistem. Harap perbarui kata sandi baru Anda sebelum melanjutkan.',
                'token' => $tempToken,
                'token_type' => 'Bearer',
                'user' => new TenantUserResource($user->load(['tenantProfile.room.property', 'property'])),
            ], 403);
        }

        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Autentikasi berhasil.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new TenantUserResource($user->load(['tenantProfile.room.property', 'property'])),
        ]);
    }

    /**
     * Pembaruan kata sandi akun anak kos via API.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['nullable', 'string'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ]);

        if (! $user->must_change_password && ! empty($validated['current_password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kata sandi saat ini tidak cocok.',
                ], 422);
            }
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ])->save();

        ActivityLogger::log(
            action: 'api_change_password',
            description: "Anak kos {$user->name} (@{$user->username}) memperbarui kata sandi via Mobile App.",
            subject: $user
        );

        // Hapus token sementara jika ada dan terbitkan token fresh
        $user->tokens()->delete();
        $freshToken = $user->createToken('tenant-mobile-app')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diperbarui.',
            'token' => $freshToken,
            'token_type' => 'Bearer',
            'user' => new TenantUserResource($user->load(['tenantProfile.room.property', 'property'])),
        ]);
    }

    /**
     * Revoke Bearer Token (Logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Sesi mobile berhasil diakhiri.',
        ]);
    }
}
