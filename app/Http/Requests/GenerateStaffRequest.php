<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'min:8', 'max:20'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'property_id' => ['required', 'exists:properties,id'],
        ];
    }
}
