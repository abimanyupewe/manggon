<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantBillResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'billing_period' => $this->billing_period,
            'amount' => (float) $this->amount,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'proof_image' => $this->proof_image,
            'rejection_reason' => $this->rejection_reason,
            'payment_date' => $this->payment_date?->toIso8601String(),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'notes' => $this->notes,
            'property_name' => $this->property?->name,
            'room_number' => $this->room?->room_number,
            'bank_account_info' => $this->property?->bank_account_info,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
