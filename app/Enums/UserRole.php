<?php

namespace App\Enums;

enum UserRole: string
{
    case OWNER = 'owner';
    case STAFF = 'staff';
    case TENANT = 'tenant';

    public function label(): string
    {
        return match ($this) {
            self::OWNER => 'Pemilik Kos',
            self::STAFF => 'Staf Penjaga',
            self::TENANT => 'Anak Kos',
        };
    }
}
