<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * SECURITY NOTE: Be careful what you expose based on context
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Basic public info (safe to expose)
            'profile' => [
                'name' => $this->name,
                'last_name' => $this->last_name,
                'email' => $this->email,
                'city' => $this->city,
                'date_of_birth' => $this->date_of_birth,
                'biography' => $this->biography,
                'profile_picture' => $this->getProfilePictureUrl(),
                'motivation_lettre'=>$this->motivation_lettre
            ],

            // Authentication & session info (user-specific)
            'auth_info' => $this->when($this->isCurrentUser($request), [
                'onboarding_skipped' => (bool) $this->onboarding_skipped,
                'onboarding_completed' => (bool) $this->onboarding_completed,
                'is_approved' => (bool) $this->is_approved,
                'approved_at' => $this->approved_at?->toIso8601String(),
                'email_verified' => $this->hasVerifiedEmail(),
            ]),

            // Professional data (context-aware)
            'professional' => $this->getProfessionalData($request),

            // Subscription info (user-specific or admin)
            'subscription' => [
                'has_pro_plus' => $this->hasProPlus(),
                'subscription_type' => $this->getAbonnementType(),
                'status' => $this->hasActiveSubscription() ? 'active' : 'inactive',
                'end_date' => optional($this->getSubscriptionEndDate())->toDateString(),
                'is_active' => $this->hasActiveSubscription(),
                'features' => [
                    'basic_analytics' => true, // you can customize based on type
                    'limited_account_linking' => true,
                    'standard_support' => true,
                    'unlimited_account_linking' => $this->hasProPlus(),
                    'advanced_analytics' => $this->hasProPlus(),
                    'priority_support' => $this->hasProPlus(),
                    'custom_reports' => $this->hasProPlus(),
                    'api_access' => $this->hasProPlus(),
                    'bulk_operations' => $this->hasProPlus(),
                ],
            ],

            // Payment info (sensitive - restrict access)
            'payment' => $this->when(
                $this->isCurrentUser($request) || $this->isAdmin($request),
                $this->getPaymentData()
            ),

            // Admin-only fields
            'admin' => $this->when($this->isAdmin($request), [
                'is_approved' => (bool) $this->is_approved,
                'rejection_reason' => $this->rejection_reason,
                'motivation_letter' => $this->motivation_letter,
                'last_login_at' => $this->last_login_at?->toIso8601String(),
                'login_count' => $this->login_count ?? 0,
                'is_active' => (bool) $this->is_active,
            ]),

            // Roles & permissions
            'roles' => $this->whenLoaded('roles', $this->getRoles()),

            // Timestamps
            'timestamps' => [
                'created_at' => $this->created_at?->toIso8601String(),
                'updated_at' => $this->updated_at?->toIso8601String(),
            ],
        ];
    }

    /**
     * FIXED: Always return an array, not a MissingValue
     */
    private function getProfessionalData(Request $request): array
    {
        // Only show professional data if user is professional or admin is viewing
        $shouldShow = $this->hasRole('professionnel') ||
                     $this->isAdmin($request) ||
                     $this->isCurrentUser($request);

        if (!$shouldShow) {
            // Return empty array when condition fails
            return [];
        }

        return [
            'commission_rate' => (float) $this->commission_rate,
            'is_professional' => $this->hasRole('professionnel'),
            'professional_since' => $this->approved_at?->toIso8601String(),
        ];
    }

    /**
     * Get subscription data including Pro Plus status
     */
    private function getSubscriptionData(): array
    {
        // Check if user has active Pro Plus subscription
        $hasProPlus = $this->hasActiveProPlusSubscription();

        return [
            'has_pro_plus' => $hasProPlus,
            'subscription_type' => $this->getSubscriptionType(),
            'status' => $this->getSubscriptionStatus(),
            'end_date' => $this->getSubscriptionEndDate(),
            'is_active' => $hasProPlus,
            'features' => $this->getSubscriptionFeatures(),
        ];
    }

    private function getPaymentData(): array
    {
        return [
            'stripe_account_id' => $this->stripeAccount_id,
            'paypal_account_id' => $this->paypalAccount_id,
            'paypal_email' => $this->paypalEmail,
            'has_payment_method' => !empty($this->stripeAccount_id) || !empty($this->paypalAccount_id),
        ];
    }

    private function getRoles(): array
    {
        return $this->roles->map(fn($role) => [
            'id' => $role->id,
            'role' => $role->role,
        ])->toArray();
    }

    private function getProfilePictureUrl(): ?string
    {
        if (!$this->profile_picture) {
            return null;
        }

        // ✅ Vérifier si le fichier existe réellement
        if (!Storage::disk('public')->exists($this->profile_picture)) {
            return null;
        }

        if (Str::startsWith($this->profile_picture, ['http://', 'https://'])) {
            return $this->profile_picture;
        }

        return Storage::disk('public')->url($this->profile_picture);
    }

    /**
     * Check if user has active Pro Plus subscription
     */
    private function hasActiveProPlusSubscription(): bool
    {
        // Method 1: If you have a direct relationship with subscriptions
        if ($this->relationLoaded('subscriptions')) {
            return $this->subscriptions
                ->where('status', 'active')
                ->where('type', 'pro_plus')
                ->where('ends_at', '>', now())
                ->isNotEmpty();
        }

        // Method 2: If you have a direct column on users table
        if (isset($this->subscription_type)) {
            return $this->subscription_type === 'pro_plus' &&
                   $this->subscription_status === 'active' &&
                   (!isset($this->subscription_ends_at) || $this->subscription_ends_at > now());
        }

        // Method 3: Check via relationship (adjust based on your schema)
        if (method_exists($this, 'subscription')) {
            $subscription = $this->subscription;
            return $subscription &&
                   $subscription->active() &&
                   $subscription->type === 'pro_plus';
        }

        // Default: Check if user has pro_plus role
        return $this->hasRole('pro_plus');
    }

    /**
     * Get subscription type
     */
    private function getSubscriptionType(): ?string
    {
        if (isset($this->subscription_type)) {
            return $this->subscription_type;
        }

        if ($this->relationLoaded('subscriptions')) {
            return $this->subscriptions
                ->where('status', 'active')
                ->sortByDesc('created_at')
                ->first()?->type;
        }

        return null;
    }

    /**
     * Get subscription status
     */
    private function getSubscriptionStatus(): ?string
    {
        if (isset($this->subscription_status)) {
            return $this->subscription_status;
        }

        if ($this->relationLoaded('subscriptions')) {
            return $this->subscriptions
                ->where('type', 'pro_plus')
                ->sortByDesc('created_at')
                ->first()?->status;
        }

        return null;
    }

    /**
     * Get subscription end date
     */
    private function getSubscriptionEndDate(): ?string
    {
        if (isset($this->subscription_ends_at)) {
            return $this->subscription_ends_at?->toIso8601String();
        }

        if ($this->relationLoaded('subscriptions')) {
            return $this->subscriptions
                ->where('type', 'pro_plus')
                ->where('status', 'active')
                ->sortByDesc('created_at')
                ->first()?->ends_at?->toIso8601String();
        }

        return null;
    }

    /**
     * Get available features based on subscription
     */
    private function getSubscriptionFeatures(): array
    {
        $hasProPlus = $this->hasActiveProPlusSubscription();

        $baseFeatures = [
            'basic_analytics' => true,
            'limited_account_linking' => true,
            'standard_support' => true,
        ];

        $proFeatures = [
            'unlimited_account_linking' => $hasProPlus,
            'advanced_analytics' => $hasProPlus,
            'priority_support' => $hasProPlus,
            'custom_reports' => $hasProPlus,
            'api_access' => $hasProPlus,
            'bulk_operations' => $hasProPlus,
        ];

        return array_merge($baseFeatures, $proFeatures);
    }

    /**
     * Check if the requested user is the current authenticated user
     */
    private function isCurrentUser(Request $request): bool
    {
        return $request->user() && $request->user()->id === $this->id;
    }

    /**
     * Check if the current user is admin
     */
    private function isAdmin(Request $request): bool
    {
        if (!$request->user()) {
            return false;
        }

        return $request->user()->roles->contains('role', 'admin');
    }

    /**
     * Helper method to check if user has role
     */
    private function hasRole(string $role): bool
    {
        return $this->roles->contains('role', $role);
    }
}
