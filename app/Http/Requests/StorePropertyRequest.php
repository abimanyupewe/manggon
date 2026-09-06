<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:properties,slug,' . $this->route('property')?->id],
            'address' => ['required', 'string'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['string'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string'],
            'bank_account_info' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
