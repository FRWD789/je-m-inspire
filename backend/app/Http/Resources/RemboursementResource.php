<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RemboursementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'montant' => (float) $this->montant,
            'motif' => $this->motif,
            'statut' => $this->statut,
            'commentaire_admin' => $this->commentaire_admin,
            'date_traitement' => $this->date_traitement?->toIso8601String(),
            'user' => new UserResource($this->whenLoaded('user')),
            'operation' => new OperationResource($this->whenLoaded('operation')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
