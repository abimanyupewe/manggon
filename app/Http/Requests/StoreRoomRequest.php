<?php

namespace App\Http\Requests;

use App\Enums\RoomStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        $roomId = $this->route('room')?->id;
        $propertyId = $this->input('property_id') ?? $this->route('room')?->property_id;

        return [
            'property_id' => ['required', 'exists:properties,id'],
            'room_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('rooms', 'room_number')
                    ->where('property_id', $propertyId)
                    ->ignore($roomId),
            ],
            'floor' => ['nullable', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', new Enum(RoomStatus::class)],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['string'],
            'description' => ['nullable', 'string'],
        ];
    }
}
