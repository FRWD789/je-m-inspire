<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'city' => $this->city,
            'date_of_birth' => $this->date_of_birth,
            'profile_picture' => $this->profile_picture, // ✅ AJOUTÉ
            'is_approved' => (bool) $this->is_approved,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'commission_rate' => $this->when(
                isset($this->commission_rate),
                (float) $this->commission_rate
            ),

            // ✅ Relations optionnelles
            'roles' => $this->whenLoaded('roles', function() {
                return $this->roles->map(function($role) {
                    return [
                        'id' => $role->id,
                        'role' => $role->role,
                    ];
                });
            }),

            // ✅ Informations supplémentaires conditionnelles
            'stripeAccount_id' => $this->when(
                isset($this->stripeAccount_id),
                $this->stripeAccount_id
            ),

            'paypalAccount_id' => $this->when(
                isset($this->paypalAccount_id),
                $this->paypalAccount_id
            ),

            'paypalEmail' => $this->when(
                isset($this->paypalEmail),
                $this->paypalEmail
            ),

            'motivation_letter' => $this->when(
                isset($this->motivation_letter),
                $this->motivation_letter
            ),

            'rejection_reason' => $this->when(
                isset($this->rejection_reason),
                $this->rejection_reason
            ),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
