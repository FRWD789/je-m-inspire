<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class EnsureUserIsProfessional
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user instanceof User) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->roles()->where('role', 'professionnel')->exists()) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        return $next($request);
    }
}
