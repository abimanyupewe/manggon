<?php

namespace App\Policies;

use App\Models\Room;
use App\Models\User;

class RoomPolicy
{
    /**
     * Tentukan apakah user dapat melihat daftar kamar.
     */
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isStaff();
    }

    /**
     * Tentukan apakah user dapat melihat detail kamar spesifik.
     */
    public function view(User $user, Room $room): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $room->property_id;
        }

        if ($user->isTenant()) {
            return $user->tenantProfile?->room_id === $room->id;
        }

        return false;
    }

    /**
     * Hanya Pemilik (Owner) yang berhak menambah kamar baru.
     */
    public function create(User $user): bool
    {
        return $user->isOwner();
    }

    /**
     * Hanya Pemilik (Owner) yang berhak mengubah spesifikasi/harga kamar.
     */
    public function update(User $user, Room $room): bool
    {
        return $user->isOwner();
    }

    /**
     * Pembaruan status ketersediaan kamar (empty, occupied, maintenance).
     * Dapat diubah oleh Owner atau Staf di cabangnya.
     */
    public function updateStatus(User $user, Room $room): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $room->property_id;
        }

        return false;
    }

    /**
     * Hanya Pemilik (Owner) yang berhak menghapus data kamar.
     */
    public function delete(User $user, Room $room): bool
    {
        return $user->isOwner();
    }
}
