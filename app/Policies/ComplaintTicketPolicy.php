<?php

namespace App\Policies;

use App\Models\ComplaintTicket;
use App\Models\User;

class ComplaintTicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ComplaintTicket $ticket): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $ticket->property_id;
        }

        if ($user->isTenant()) {
            return $user->id === $ticket->tenant_id;
        }

        return false;
    }

    /**
     * Anak kos membuat tiket keluhan fasilitas kamar.
     */
    public function create(User $user): bool
    {
        return $user->isTenant();
    }

    /**
     * Staf cabang penugasan atau Owner menindaklanjuti tiket keluhan.
     */
    public function handle(User $user, ComplaintTicket $ticket): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $ticket->property_id;
        }

        return false;
    }

    /**
     * Staf cabang penugasan atau Owner menyelesaikan / menutup tiket keluhan.
     */
    public function resolve(User $user, ComplaintTicket $ticket): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $ticket->property_id;
        }

        return false;
    }
}
