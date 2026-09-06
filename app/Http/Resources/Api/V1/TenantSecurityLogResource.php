<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantSecurityLogResource extends JsonResource
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
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'date' => $this->date?->format('Y-m-d'),
            'planned_time' => $this->planned_time,
            'actual_time' => $this->actual_time,
            'guest_name' => $this->guest_name,
            'notes' => $this->notes,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'rejection_reason' => $this->rejection_reason,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'approved_by_name' => $this->approver?->name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
