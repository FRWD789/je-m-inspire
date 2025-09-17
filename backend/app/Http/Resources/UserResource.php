<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'last_name'     => $this->last_name,
            'email'         => $this->email,
            'date_of_birth' => $this->date_of_birth,
            'city'          => $this->city,
            'profile_picture' => $this->profile_picture,
            'created_at'    => $this->created_at->toDateTimeString(),
        ];
    }
}
