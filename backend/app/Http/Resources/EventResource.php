<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'start_date' => $this->start_date?->toIso8601String(),
            'end_date' => $this->end_date?->toIso8601String(),
            'base_price' => (float) $this->base_price,
            'available_places' => $this->available_places,
            'max_places' => $this->max_places,
            'level' => $this->level,
            'priority' => $this->priority,
            'localisation' => new LocalisationResource($this->whenLoaded('localisation')),
            'categorie' => new CategorieEventResource($this->whenLoaded('categorie')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'can_reserve' => $this->available_places > 0 && $this->start_date > now(),
            'is_past' => $this->end_date < now(),
            'is_ongoing' => $this->start_date <= now() && $this->end_date >= now(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
