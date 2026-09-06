<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'room_id',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'identity_card_number',
        'identity_card_image',
        'entry_date',
        'exit_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'exit_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
