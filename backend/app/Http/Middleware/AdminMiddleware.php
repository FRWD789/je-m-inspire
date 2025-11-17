<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if (!$user || !$user->roles()->where('role', 'admin')->exists()) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        return $next($request);
    }
}
