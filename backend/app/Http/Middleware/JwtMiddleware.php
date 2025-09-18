<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Exception;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        try{
            $token = JWTAuth::parseToken();
            $payload = $token->getPayload();  
            if ($payload->get('type') !== 'access') {
                    return response()->json(['error' => 'Invalid token type'], 401);
                }
            $user = JWTAuth::parseToken()->authenticate();
  
         
        }catch(Exception $e){
            return response()->json(['error' => 'Unauthorized'], 401);

        }
        $request->merge(['user' => $user]);
        return $next($request);
    }
}
