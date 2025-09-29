<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description,
            'start_date'       => $this->start_date,
            'end_date'         => $this->end_date,
            'base_price'       => $this->base_price,
            'capacity'         => $this->capacity,
            'max_places'       => $this->max_places,
            'available_places' => $this->available_places,
            'level'            => $this->level,
            'priority'         => $this->priority,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
