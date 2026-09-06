<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Tentukan apakah user dapat melihat daftar pengguna.
     */
    public function viewAny(User $user): bool
    {
        return $user->isOwner() || $user->isStaff();
    }

    /**
     * Staf hanya diizinkan melihat profil pengguna di cabangnya.
     */
    public function view(User $user, User $model): bool
    {
        if ($user->isOwner()) {
            return true;
        }

        if ($user->isStaff()) {
            return $user->property_id === $model->property_id;
        }

        return $user->id === $model->id;
    }

    /**
     * Hak pembuatan akun (Staf & Tenant) terkunci hanya untuk Pemilik (Owner).
     * Staf tidak memiliki hak membuat akun tenant (PRD 3.3 Restricted CRUD).
     */
    public function create(User $user): bool
    {
        return $user->isOwner();
    }

    /**
     * Hanya Pemilik (Owner) atau pengguna yang bersangkutan yang dapat mengubah data akun.
     */
    public function update(User $user, User $model): bool
    {
        return $user->isOwner() || $user->id === $model->id;
    }

    /**
     * Hanya Pemilik (Owner) yang berhak menghapus akun staf atau tenant.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->isOwner() && $user->id !== $model->id;
    }
}
