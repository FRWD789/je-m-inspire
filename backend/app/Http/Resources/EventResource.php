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

            // ========================================
            // ✅ IMAGES ORIGINALES (compatibilité)
            // ========================================
            // ✅ CORRIGÉ: Enlevé /api/ des URLs
            'thumbnail' => $this->thumbnail_path ? url('storage/' . $this->thumbnail_path) : null,
            'banner' => $this->banner_path ? url('storage/' . $this->banner_path) : null,

            // ========================================
            // ✅ NOUVEAUTÉ : VARIANTES RESPONSIVE
            // ========================================
            'thumbnail_path' => $this->thumbnail_path,
            'thumbnail_variants' => $this->thumbnail_path
                ? $this->getVariants($this->thumbnail_path)
                : null,

            'banner_path' => $this->banner_path,
            'banner_variants' => $this->banner_path
                ? $this->getVariants($this->banner_path)
                : null,

            'is_cancelled' => (bool) $this->is_cancelled,
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),

            // ========================================
            // ✅ IMAGES AVEC VARIANTES
            // ========================================
            'images' => $this->whenLoaded('images', function() {
                return $this->images->map(function($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->image_url,
                        'image_path' => $image->image_path,
                        'variants' => $this->getVariants($image->image_path),
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

    /**
     * ✅ MÉTHODE HELPER pour obtenir les variantes
     * Appelle la méthode du trait via le modèle
     */
    private function getVariants(?string $imagePath): ?array
    {
        if (!$imagePath) {
            return null;
        }

        // ✅ CORRECTION: Appeler via $this->resource (le modèle Event)
        if (method_exists($this->resource, 'getImageVariants')) {
            return $this->resource->getImageVariants($imagePath);
        }

        // ✅ Fallback: générer manuellement si la méthode n'existe pas
        $pathInfo = pathinfo($imagePath);
        $directory = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];

        return [
            'original' => url('storage/' . $imagePath),
            'md' => url("storage/{$directory}/{$filename}_md.jpg"),
            'lg' => url("storage/{$directory}/{$filename}_lg.jpg"),
            'xl' => url("storage/{$directory}/{$filename}_xl.jpg"),
            'md_webp' => url("storage/{$directory}/{$filename}_md.webp"),
            'lg_webp' => url("storage/{$directory}/{$filename}_lg.webp"),
            'xl_webp' => url("storage/{$directory}/{$filename}_xl.webp"),
        ];
    }
}
