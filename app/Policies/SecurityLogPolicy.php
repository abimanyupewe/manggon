<?php

namespace App\Policies;

use App\Models\SecurityLog;
use App\Models\User;

class SecurityLogPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SecurityLog $log): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $log->property_id;
        }

        if ($user->isTenant()) {
            return $user->id === $log->tenant_id;
        }

        return false;
    }

    /**
     * Anak kos mengajukan permohonan izin pulang malam atau tamu.
     */
    public function create(User $user): bool
    {
        return $user->isTenant();
    }

    /**
     * Staf cabang penugasan atau Owner berhak menyetujui izin keamanan.
     */
    public function approve(User $user, SecurityLog $log): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $log->property_id;
        }

        return false;
    }

    /**
     * Staf cabang penugasan atau Owner berhak menolak izin keamanan.
     */
    public function reject(User $user, SecurityLog $log): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $log->property_id;
        }

        return false;
    }
}
