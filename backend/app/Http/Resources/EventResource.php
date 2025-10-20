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
            'capacity' => $this->capacity,
            'max_places' => $this->max_places,
            'available_places' => $this->available_places,
            'level' => $this->level,
            'priority' => $this->priority,
            'thumbnail' => $this->thumbnail_path ? url('storage/' . $this->thumbnail_path) : null,
            'banner' => $this->banner_path ? url('storage/' . $this->banner_path) : null,
            // Images triées par ordre d'affichage
            'images' => $this->whenLoaded('images', function() {
                return $this->images->map(function($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->image_url,
                        'display_order' => $image->display_order,
                    ];
                });
            }),

            'localisation' => $this->whenLoaded('localisation', function() {
                return [
                    'id' => $this->localisation->id,
                    'name' => $this->localisation->name,
                    'address' => $this->localisation->address,
                    'lat' => (float) $this->localisation->latitude,
                    'lng' => (float) $this->localisation->longitude,
                ];
            }),

            'categorie' => $this->whenLoaded('categorie', function() {
                return [
                    'id' => $this->categorie->id,
                    'name' => $this->categorie->name,
                ];
            }),

            'creator' => $this->whenLoaded('creator', function() {
                return new UserResource($this->creator);
            }),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
