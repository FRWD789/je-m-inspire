<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->paiement_id,
            'total' => (float) $this->total,
            'status' => $this->status,
            'taux_commission' => (float) $this->taux_commission,
            'session_id' => $this->session_id,
            'paypal_id' => $this->paypal_id,
            'vendor_id' => $this->vendor_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
