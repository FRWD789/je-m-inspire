<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user instanceof User) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        // Vérifier que l'utilisateur a le rôle admin
        if (!$user->roles()->where('role', 'admin')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux administrateurs'
            ], 403);
        }

        return $next($request);
    }
}
