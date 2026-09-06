<?php

namespace App\Enums;

enum SecurityLogType: string
{
    case LATE_RETURN = 'late_return';
    case GUEST_VISIT = 'guest_visit';

    public function label(): string
    {
        return match ($this) {
            self::LATE_RETURN => 'Izin Pulang Malam',
            self::GUEST_VISIT => 'Izin Tamu Menginap',
        };
    }
}
