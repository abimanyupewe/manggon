<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'address',
        'phone_number',
        'description',
        'facilities',
        'images',
        'bank_account_info',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'facilities' => 'array',
            'images' => 'array',
            'bank_account_info' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function staff(): HasMany
    {
        return $this->hasMany(User::class)->where('role', UserRole::STAFF);
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(User::class)->where('role', UserRole::TENANT);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function securityLogs(): HasMany
    {
        return $this->hasMany(SecurityLog::class);
    }

    public function complaintTickets(): HasMany
    {
        return $this->hasMany(ComplaintTicket::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
