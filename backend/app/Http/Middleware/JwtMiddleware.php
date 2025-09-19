<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class JwtMiddleware
{
    public function handle($request, Closure $next)
    {
        try {
            // Debug : vérifiez si le token est présent
            $token = JWTAuth::getToken();
            if (!$token) {
                return response()->json([
                    'error' => 'Token not provided',
                    'headers' => $request->headers->all() // Debug headers
                ], 401);
            }

            // Authentifier l'utilisateur
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json(['error' => 'User not found'], 401);
            }

        } catch (TokenExpiredException $e) {
            return response()->json(['error' => 'Token expired'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['error' => 'Token invalid'], 401);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token error', 'message' => $e->getMessage()], 401);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentication error', 'message' => $e->getMessage()], 401);
        }

        return $next($request);
    }
}
