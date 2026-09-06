<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'room_id' => ['required', 'exists:rooms,id'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_relation' => ['nullable', 'string', 'max:100'],
            'identity_card_number' => ['nullable', 'string', 'max:50'],
            'entry_date' => ['required', 'date'],
        ];
    }
}
