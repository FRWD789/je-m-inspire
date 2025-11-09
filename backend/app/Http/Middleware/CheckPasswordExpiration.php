<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPasswordExpiration
{
    /**
     * Durée de validité du mot de passe en jours
     */
    const PASSWORD_EXPIRATION_DAYS = 90;

    /**
     * Routes exclues de la vérification
     */
    protected $excludedRoutes = [
        'logout',
        'me',
        'profile/change-expired-password',
    ];

    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Si pas d'utilisateur authentifié, continuer
        if (!$user) {
            return $next($request);
        }

        // Vérifier si la route est exclue
        $currentRoute = $request->path();
        foreach ($this->excludedRoutes as $excluded) {
            if (str_contains($currentRoute, $excluded)) {
                return $next($request);
            }
        }

        // Ne pas appliquer aux admins
        if ($user->roles->where('role', 'admin')->exists()) {
            return $next($request);
        }

        // Calculer le nombre de jours depuis la création du compte
        $accountAge = now()->diffInDays($user->created_at);

        // Si le mot de passe a expiré
        if ($accountAge >= self::PASSWORD_EXPIRATION_DAYS) {
            return response()->json([
                'success' => false,
                'message' => 'Votre mot de passe a expiré. Veuillez le changer pour continuer.',
                'password_expired' => true,
                'days_since_creation' => $accountAge,
                'expiration_days' => self::PASSWORD_EXPIRATION_DAYS
            ], 403);
        }

        return $next($request);
    }
}
