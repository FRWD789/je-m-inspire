<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type_operation_id' => $this->type_operation_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'event' => new EventResource($this->whenLoaded('event')),
            'paiement' => new PaiementResource($this->whenLoaded('paiement')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
