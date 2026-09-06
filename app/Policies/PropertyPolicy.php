<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    /**
     * Tentukan apakah user dapat melihat daftar properti cabang.
     */
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isStaff();
    }

    /**
     * Tentukan apakah user dapat melihat detail suatu cabang.
     * Staf hanya diizinkan melihat cabang tempat ia ditugaskan.
     */
    public function view(User $user, Property $property): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $property->id;
        }

        return false;
    }

    /**
     * Hanya Pemilik (Owner) yang berhak menambah cabang baru.
     */
    public function create(User $user): bool
    {
        return $user->isOwner();
    }

    /**
     * Hanya Pemilik (Owner) yang berhak memperbarui data cabang.
     */
    public function update(User $user, Property $property): bool
    {
        return $user->isOwner();
    }

    /**
     * Hanya Pemilik (Owner) yang berhak menghapus data cabang.
     */
    public function delete(User $user, Property $property): bool
    {
        return $user->isOwner();
    }
}
