<?php

namespace App\Http\Controllers;

use App\Enums\RoomStatus;
use App\Enums\UserRole;
use App\Http\Requests\GenerateStaffRequest;
use App\Http\Requests\GenerateTenantRequest;
use App\Models\Room;
use App\Models\TenantProfile;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\CredentialGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Tampilkan daftar staf dan anak kos.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = $request->user();
        $query = User::with(['property', 'tenantProfile.room']);

        if ($user->isStaff()) {
            $query->where('property_id', $user->property_id)->where('role', UserRole::TENANT);
        } elseif ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->input('property_id'));
        }

        $users = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $users,
            ]);
        }

        return Inertia::render('users/index', [
            'users' => $users,
            'properties' => \App\Models\Property::all(),
            'available_rooms' => \App\Models\Room::with('property')->where('status', \App\Enums\RoomStatus::EMPTY)->get(),
        ]);
    }

    /**
     * Otomatis membuat akun Staf Penjaga Kos (Owner only).
     */
    public function generateStaff(GenerateStaffRequest $request, CredentialGeneratorService $generator): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();

        $username = $generator->generateStaffUsername($validated['name'], $validated['phone_number']);
        $plainPassword = $generator->generateTemporaryPassword(8);

        $staff = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'username' => $username,
            'phone_number' => $validated['phone_number'],
            'password' => Hash::make($plainPassword),
            'role' => UserRole::STAFF,
            'property_id' => $validated['property_id'],
            'is_active' => true,
            'must_change_password' => true,
        ]);

        ActivityLogger::log(
            action: 'generate_staff_account',
            description: "Pemilik membuat akun staf baru {$staff->name} (@{$username}) untuk cabang ID {$staff->property_id}.",
            subject: $staff
        );

        $credentials = [
            'username' => $username,
            'temporary_password' => $plainPassword,
            'staff' => $staff,
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Akun staf berhasil dibuat.',
                'data' => $credentials,
            ], 201);
        }

        return redirect()->back()->with([
            'success' => "Akun staf {$staff->name} berhasil dibuat.",
            'generated_credentials' => $credentials,
        ]);
    }

    /**
     * Otomatis mendaftarkan Anak Kos Putri & generate kredensial (Owner only).
     */
    public function generateTenant(GenerateTenantRequest $request, CredentialGeneratorService $generator): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();
        $room = Room::with('property')->findOrFail($validated['room_id']);

        if ($room->status === RoomStatus::OCCUPIED) {
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Kamar {$room->room_number} saat ini sudah terisi.",
                ], 422);
            }
            return redirect()->back()->withErrors(['room_id' => "Kamar {$room->room_number} saat ini sudah terisi."]);
        }

        $username = $generator->generateTenantUsername($room->room_number);
        $plainPassword = $generator->generateTemporaryPassword(8);

        $tenantData = DB::transaction(function () use ($validated, $room, $username, $plainPassword) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'username' => $username,
                'phone_number' => $validated['phone_number'] ?? null,
                'password' => Hash::make($plainPassword),
                'role' => UserRole::TENANT,
                'property_id' => $room->property_id,
                'is_active' => true,
                'must_change_password' => true,
            ]);

            TenantProfile::create([
                'user_id' => $user->id,
                'room_id' => $room->id,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'emergency_contact_relation' => $validated['emergency_contact_relation'] ?? null,
                'identity_card_number' => $validated['identity_card_number'] ?? null,
                'entry_date' => $validated['entry_date'],
            ]);

            $room->update(['status' => RoomStatus::OCCUPIED]);

            ActivityLogger::log(
                action: 'generate_tenant_account',
                description: "Pemilik mendaftarkan anak kos baru {$user->name} (@{$username}) di Kamar {$room->room_number}.",
                subject: $user
            );

            return [
                'username' => $username,
                'temporary_password' => $plainPassword,
                'tenant' => $user->load('tenantProfile.room'),
            ];
        });

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Akun anak kos berhasil didaftarkan.',
                'data' => $tenantData,
            ], 201);
        }

        return redirect()->back()->with([
            'success' => "Anak kos {$tenantData['tenant']->name} berhasil didaftarkan.",
            'generated_credentials' => $tenantData,
        ]);
    }
}
