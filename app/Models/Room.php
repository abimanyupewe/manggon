<?php

namespace App\Models;

use App\Enums\RoomStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'room_number',
        'floor',
        'price',
        'status',
        'facilities',
        'images',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'status' => RoomStatus::class,
            'price' => 'decimal:2',
            'floor' => 'integer',
            'facilities' => 'array',
            'images' => 'array',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function tenantProfile(): HasOne
    {
        return $this->hasOne(TenantProfile::class);
    }

    public function complaintTickets(): HasMany
    {
        return $this->hasMany(ComplaintTicket::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
