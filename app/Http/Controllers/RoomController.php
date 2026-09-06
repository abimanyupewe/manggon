<?php

namespace App\Http\Controllers;

use App\Enums\RoomStatus;
use App\Http\Requests\StoreRoomRequest;
use App\Models\Room;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Tampilkan daftar kamar dengan filter cabang dan status.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = $request->user();
        $query = Room::with(['property', 'tenantProfile.user']);

        if ($user->isStaff()) {
            $query->where('property_id', $user->property_id);
        } elseif ($request->filled('property_id')) {
            $query->where('property_id', $request->input('property_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $rooms = $query->orderBy('property_id')->orderBy('floor')->orderBy('room_number')->get();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $rooms,
            ]);
        }

        return Inertia::render('rooms/index', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Tambah kamar baru (Owner only).
     */
    public function store(StoreRoomRequest $request): JsonResponse|RedirectResponse
    {
        $room = Room::create($request->validated());

        ActivityLogger::log(
            action: 'create_room',
            description: "Pemilik menambahkan kamar {$room->room_number} di properti ID {$room->property_id}.",
            subject: $room
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => "Kamar {$room->room_number} berhasil ditambahkan.",
                'data' => $room,
            ], 201);
        }

        return redirect()->back()->with('success', "Kamar {$room->room_number} berhasil ditambahkan.");
    }

    /**
     * Perbarui data kamar (Owner only).
     */
    public function update(StoreRoomRequest $request, Room $room): JsonResponse|RedirectResponse
    {
        $room->update($request->validated());

        ActivityLogger::log(
            action: 'update_room',
            description: "Pemilik memperbarui kamar {$room->room_number}.",
            subject: $room
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => "Data kamar {$room->room_number} berhasil diperbarui.",
                'data' => $room,
            ]);
        }

        return redirect()->back()->with('success', "Data kamar {$room->room_number} berhasil diperbarui.");
    }

    /**
     * Ubah status ketersediaan kamar (Bisa dilakukan oleh Staf cabangnya atau Pemilik).
     */
    public function updateStatus(Request $request, Room $room): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->isStaff() && $user->property_id !== $room->property_id) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengubah status kamar di cabang lain.');
        }

        $validated = $request->validate([
            'status' => ['required', new Enum(RoomStatus::class)],
        ]);

        $statusBefore = $room->status->value;
        $room->update(['status' => $validated['status']]);

        ActivityLogger::log(
            action: 'update_room_status',
            description: "Mengubah status kamar {$room->room_number} dari '{$statusBefore}' menjadi '{$validated['status']}'.",
            subject: $room,
            properties: ['status_before' => $statusBefore, 'status_after' => $validated['status']]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => "Status kamar {$room->room_number} berhasil diperbarui menjadi {$validated['status']}.",
                'data' => $room,
            ]);
        }

        return redirect()->back()->with('success', "Status kamar {$room->room_number} berhasil diperbarui.");
    }

    /**
     * Hapus kamar (Owner only).
     */
    public function destroy(Request $request, Room $room): JsonResponse|RedirectResponse
    {
        if (! $request->user()->isOwner()) {
            abort(403, 'Hanya Pemilik yang berhak menghapus kamar.');
        }

        $number = $room->room_number;
        $room->delete();

        ActivityLogger::log(
            action: 'delete_room',
            description: "Pemilik menghapus kamar {$number}."
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => "Kamar {$number} berhasil dihapus.",
            ]);
        }

        return redirect()->back()->with('success', "Kamar {$number} berhasil dihapus.");
    }
}
