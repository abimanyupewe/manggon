<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    /**
     * Tentukan apakah user dapat melihat daftar tagihan/pembayaran.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Tentukan apakah user dapat melihat detail tagihan pembayaran.
     */
    public function view(User $user, Payment $payment): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $payment->property_id;
        }

        if ($user->isTenant()) {
            return $user->id === $payment->tenant_id;
        }

        return false;
    }

    /**
     * Kontrol Finansial Mutlak: Hanya Pemilik yang berhak membuat tagihan.
     * Staf dilarang membuat tagihan secara sepihak untuk mencegah fraud.
     */
    public function create(User $user): bool
    {
        return $user->isOwner();
    }

    /**
     * Kontrol Finansial Mutlak: Hanya Pemilik yang berhak mengedit data/nominal tagihan.
     */
    public function update(User $user, Payment $payment): bool
    {
        return $user->isOwner();
    }

    /**
     * Kontrol Finansial Mutlak: Hanya Pemilik yang berhak menghapus data tagihan.
     */
    public function delete(User $user, Payment $payment): bool
    {
        return $user->isOwner();
    }

    /**
     * Anak kos berhak mengunggah bukti transfer sewa mandiri miliknya.
     */
    public function uploadProof(User $user, Payment $payment): bool
    {
        return $user->isTenant() && $user->id === $payment->tenant_id;
    }

    /**
     * Validasi pembayaran (Validasi / Tolak bukti transfer).
     * Dapat dilakukan oleh Staf penanggung jawab cabang tersebut atau Pemilik.
     */
    public function verify(User $user, Payment $payment): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $payment->property_id;
        }

        return false;
    }
}
