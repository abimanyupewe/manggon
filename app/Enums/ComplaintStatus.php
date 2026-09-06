<?php

namespace App\Enums;

enum ComplaintStatus: string
{
    case PENDING = 'pending';
    case IN_PROGRESS = 'in_progress';
    case RESOLVED = 'resolved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Tindakan',
            self::IN_PROGRESS => 'Sedang Dikerjakan',
            self::RESOLVED => 'Selesai Diperbaiki',
            self::REJECTED => 'Ditolak',
        };
    }
}
