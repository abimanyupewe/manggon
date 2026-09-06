<?php

namespace App\Enums;

enum RoomStatus: string
{
    case EMPTY = 'empty';
    case OCCUPIED = 'occupied';
    case MAINTENANCE = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::EMPTY => 'Kosong',
            self::OCCUPIED => 'Terisi',
            self::MAINTENANCE => 'Perbaikan',
        };
    }
}
