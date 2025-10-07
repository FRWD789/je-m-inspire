<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbonnementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->abonnement_id,
            'status' => $this->status,
            'start_date' => $this->start_date?->toIso8601String(),
            'end_date' => $this->end_date?->toIso8601String(),
            'stripe_subscription_id' => $this->stripe_subscription_id,
            'paypal_subscription_id' => $this->paypal_subscription_id,
            'paiement_id' => $this->paiement_id,
            'provider' => $this->stripe_subscription_id ? 'stripe' : ($this->paypal_subscription_id ? 'paypal' : null),
            'is_active' => $this->status === 'active',
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
