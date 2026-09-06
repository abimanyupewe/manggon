<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case UNPAID = 'unpaid';
    case PENDING_VERIFICATION = 'pending_verification';
    case PAID = 'paid';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::UNPAID => 'Belum Dibayar',
            self::PENDING_VERIFICATION => 'Menunggu Verifikasi',
            self::PAID => 'Lunas',
            self::REJECTED => 'Ditolak',
        };
    }
}
