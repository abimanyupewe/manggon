<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->tenantProfile;
        $room = $profile?->room;
        $property = $this->property ?? $room?->property;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'role' => $this->role?->value ?? $this->role,
            'must_change_password' => (bool) $this->must_change_password,
            'is_active' => (bool) $this->is_active,
            'property' => $property ? [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'phone_number' => $property->phone_number,
                'facilities' => $property->facilities,
                'bank_account_info' => $property->bank_account_info,
            ] : null,
            'room' => $room ? [
                'id' => $room->id,
                'room_number' => $room->room_number,
                'floor' => $room->floor,
                'price' => (float) $room->price,
                'facilities' => $room->facilities,
            ] : null,
            'profile' => $profile ? [
                'emergency_contact_name' => $profile->emergency_contact_name,
                'emergency_contact_phone' => $profile->emergency_contact_phone,
                'emergency_contact_relation' => $profile->emergency_contact_relation,
                'identity_card_number' => $profile->identity_card_number,
                'entry_date' => $profile->entry_date?->format('Y-m-d'),
                'exit_date' => $profile->exit_date?->format('Y-m-d'),
            ] : null,
        ];
    }
}
