<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\CookieTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AuthV2Controller extends AuthController
{
    use CookieTrait;

    const MAX_LOGIN_ATTEMPTS = 5;

    public function login(Request $request)
    {
        // Rate limiting
        $throttleKey = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_LOGIN_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return $this->errorResponse(
                'Trop de tentatives de connexion. Veuillez réessayer dans ' . $seconds . ' secondes.',
                429
            );
        }

        RateLimiter::hit($throttleKey);

        try {
            $credentials = $request->validate([
                'email' => 'required|email|max:255',
                'password' => 'required|string|min:1',
            ]);

            // Sanitize input
            $credentials['email'] = strtolower(trim($credentials['email']));

            $user = User::where('email', $credentials['email'])->first();

            if (!$user) {
                Log::warning('Tentative de connexion avec email inexistant', [
                    'email' => $credentials['email'],
                    'ip' => $request->ip()
                ]);
                return $this->errorResponse('Identifiants invalides', 401);
            }

            if (!$user->is_approved) {
                $reason = $user->rejection_reason
                    ? 'Compte rejeté : ' . $user->rejection_reason
                    : 'Compte en attente d\'approbation';

                Log::warning('Tentative de connexion compte non approuvé', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ip' => $request->ip()
                ]);

                return $this->errorResponse($reason, 403);
            }

            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)) {
                Log::warning('Tentative de connexion avec mot de passe incorrect', [
                    'email' => $credentials['email'],
                    'ip' => $request->ip()
                ]);
                return $this->errorResponse('Identifiants invalides', 401);
            }

            RateLimiter::clear($throttleKey);

            $user->last_login_at = now();
            $user->save();

            $user->load('roles');
            $refreshToken = $this->generateRefreshToken($user);

            Log::info('Connexion réussie', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return $this->successResponse([
               'user' => new UserResource($user), // Uses the new grouped resource
                'access_token' => $accessToken,
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'requires_onboarding' => !$user->onboarding_completed && !$user->onboarding_skipped, // Added for frontend
            ], 'Connexion réussie')->withCookie(
                $this->createRefreshTokenCookie($refreshToken) // Clean cookie creation!
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (JWTException $e) {
            Log::error('Erreur JWT login: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la connexion', 500);
        } catch (\Exception $e) {
            Log::error('Erreur inattendue login: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la connexion', 500);
        }
    }

    public function refresh(Request $request)
    {
        $debug = config('app.debug');

        if ($debug) {
            Log::info('🔄 ========== REFRESH TOKEN V2 START ==========');
        }

        try {
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                Log::error('❌ V2: Refresh token manquant');
                return $this->errorResponse('Refresh token manquant', 401);
            }

            $payload = JWTAuth::setToken($refreshToken)->getPayload();
            $jti = $payload->get('jti');
            $userId = $payload->get('sub');
            $tokenType = $payload->get('type');

            if ($tokenType !== 'refresh') {
                Log::error('❌ V2: Token type incorrect', ['type' => $tokenType]);
                return $this->errorResponse('Token invalide', 401);
            }

            $cacheKey = "refresh_token:$jti";
            $cachedUserId = Cache::get($cacheKey);

            if (!$cachedUserId || $cachedUserId != $userId) {
                Log::error('❌ V2: Refresh token non trouvé dans Redis');
                return $this->errorResponse('Refresh token invalide ou expiré', 401);
            }

            $user = User::with('roles')->find($userId);
            
            if (!$user) {
                Log::error('❌ V2: Utilisateur non trouvé');
                return $this->errorResponse('Utilisateur non trouvé', 401);
            }

            if (!$user->is_approved) {
                Log::error('❌ V2: Utilisateur non approuvé');
                return $this->errorResponse('Compte non approuvé', 403);
            }

            Cache::forget($cacheKey);

            $newRefreshToken = $this->generateRefreshToken($user);
            $newAccessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);

            Log::info('✅ V2: Refresh réussi', ['user_id' => $user->id]);
            $request->setUserResolver(fn () => $user);
            return $this->successResponse([
                'access_token' => $newAccessToken,
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'user' => new UserResource($user)
            ], 'Token rafraîchi')->withCookie(
                $this->createRefreshTokenCookie($newRefreshToken) // Clean cookie!
            );

        } catch (JWTException $e) {
            Log::error('❌ V2: Erreur JWT refresh:', ['message' => $e->getMessage()]);
            return $this->errorResponse('Refresh token invalide', 401);
        } catch (\Exception $e) {
            Log::error('❌ V2: Erreur inattendue refresh:', ['message' => $e->getMessage()]);
            return $this->errorResponse('Erreur lors du refresh', 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $refreshToken = $request->cookie('refresh_token');

            if ($refreshToken) {
                try {
                    $payload = JWTAuth::setToken($refreshToken)->getPayload();
                    $jti = $payload->get('jti');
                    Cache::forget("refresh_token:$jti");
                } catch (\Exception $e) {
                    Log::warning('Error invalidating refresh token', ['error' => $e->getMessage()]);
                }
            }

            Log::info('Déconnexion réussie', ['user_id' => Auth::id()]);

            return $this->successResponse(null, 'Déconnexion réussie')
                ->withCookie($this->createExpiredCookie('refresh_token')); // Clean logout!

        } catch (\Exception $e) {
            Log::error('Erreur logout: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la déconnexion', 500);
        }
    }

    private function generateRefreshToken(User $user): string
    {
        $jti = Str::uuid()->toString();
         $customClaims = [
            'type' => 'refresh', 
            'jti' => $jti,
            'exp' => now()->addDays(7)->timestamp // 7 days from now
        ];

        $refreshToken = JWTAuth::customClaims($customClaims)->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7 * 24 * 60);

        Log::info('🎫 V2: Refresh token généré', ['user_id' => $user->id, 'jti' => $jti]);

        return $refreshToken;
    }
}