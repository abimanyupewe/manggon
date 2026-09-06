<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantComplaintResource extends JsonResource
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
            'ticket_number' => $this->ticket_number,
            'room_number' => $this->room?->room_number,
            'title' => $this->title,
            'description' => $this->description,
            'photo_evidence' => $this->photo_evidence,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'handler_name' => $this->handler?->name,
            'resolution_notes' => $this->resolution_notes,
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
