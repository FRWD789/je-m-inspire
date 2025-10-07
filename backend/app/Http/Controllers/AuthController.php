<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Inscription pour les utilisateurs réguliers
     */
    public function registerUser(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'date_of_birth' => 'required|date|before:today',
                'city' => 'nullable|string|max:255',
                'password' => 'required|string|min:6|confirmed',
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            $user = User::create([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'date_of_birth' => $validated['date_of_birth'],
                'city' => $validated['city'] ?? null,
                'password' => Hash::make($validated['password']),
                'is_approved' => true,
                'approved_at' => now(),
            ]);

            $role = Role::where('role', 'utilisateur')->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            $user->load('roles');

            $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);
            $refreshToken = $this->generateRefreshToken($user);

            return $this->successResponse([
                'user' => new UserResource($user),
                'token' => $accessToken,
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'refresh_token' => $refreshToken
            ], 'Inscription réussie', 201)->cookie(
                'refresh_token',
                $refreshToken,
                7*24*60,
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );

        } catch (\Exception $e) {
            Log::error('Erreur inscription utilisateur: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de l\'inscription', 500);
        }
    }

    /**
     * Inscription pour les professionnels (nécessite approbation)
     */
    public function registerProfessional(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'date_of_birth' => 'required|date|before:today',
                'city' => 'nullable|string|max:255',
                'password' => 'required|string|min:6|confirmed',
                'motivation_letter' => 'required|string|min:50|max:2000',
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            $user = User::create([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'date_of_birth' => $validated['date_of_birth'],
                'city' => $validated['city'] ?? null,
                'password' => Hash::make($validated['password']),
                'motivation_letter' => $validated['motivation_letter'],
                'is_approved' => false,
                'approved_at' => null,
            ]);

            $role = Role::where('role', 'professionnel')->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            $user->load('roles');

            return $this->successResponse([
                'status' => 'pending',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'is_approved' => false
                ]
            ], 'Votre demande d\'inscription a été envoyée. Un administrateur examinera votre candidature.', 201);

        } catch (\Exception $e) {
            Log::error('Erreur inscription professionnel: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de l\'inscription', 500);
        }
    }

    /**
     * Connexion
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            $user = User::where('email', $credentials['email'])->first();

            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                return $this->errorResponse('Email ou mot de passe incorrect', 401);
            }

            if (!$user->is_approved) {
                return $this->unauthorizedResponse('Votre compte est en attente d\'approbation par un administrateur.');
            }

            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)) {
                return $this->errorResponse('Identifiants invalides', 401);
            }

            $user->load('roles');
            $refreshToken = $this->generateRefreshToken($user);

            return $this->successResponse([
                'user' => new UserResource($user),
                'token' => $accessToken,
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'refresh_token' => $refreshToken
            ], 'Connexion réussie')->cookie(
                'refresh_token',
                $refreshToken,
                7*24*60,           // 7 jours
                '/',               // path
                null,              // domain (auto)
                false,             // secure (false en local HTTP)
                true,              // httpOnly
                false,             // raw
                'lax'              // SameSite
            );

        } catch (JWTException $e) {
            Log::error('Erreur JWT: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création du token', 500);
        }
    }

    /**
     * Obtenir l'utilisateur authentifié
     */
    public function me()
    {
        try {
            $user = JWTAuth::user();
            $user->load('roles');

            return $this->resourceResponse(
                new UserResource($user),
                'Utilisateur récupéré'
            );
        } catch (JWTException $e) {
            return $this->unauthenticatedResponse('Token invalide');
        }
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        try {
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                return $this->errorResponse('Aucun refresh token fourni', 400);
            }

            $payload = JWTAuth::setToken($refreshToken)->getPayload();
            $jti = $payload->get('jti');
            Cache::forget("refresh_token:$jti");

            return $this->successResponse(
                null,
                'Déconnexion réussie'
            )->cookie('refresh_token', '', -1);

        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la déconnexion', 500);
        }
    }

    /**
     * Rafraîchir le token
     */
    public function refresh(Request $request)
    {
        Log::info('🔄 ========== REFRESH TOKEN START ==========');

        try {
            // 1. Vérifier si le cookie existe
            $refreshToken = $request->cookie('refresh_token');
            Log::info('🍪 Cookie refresh_token:', [
                'exists' => !empty($refreshToken),
                'preview' => $refreshToken ? substr($refreshToken, 0, 50) . '...' : 'NULL'
            ]);

            if (!$refreshToken) {
                Log::error('❌ ERREUR: Refresh token manquant dans le cookie');
                Log::info('📋 Tous les cookies reçus:', $request->cookies->all());
                return $this->errorResponse('Refresh token manquant', 401);
            }

            // 2. Décoder le token
            Log::info('🔓 Décodage du refresh token...');
            $payload = JWTAuth::setToken($refreshToken)->getPayload();
            $jti = $payload->get('jti');
            $userId = $payload->get('sub');

            Log::info('✅ Token décodé:', [
                'jti' => $jti,
                'user_id' => $userId,
                'type' => $payload->get('type'),
                'exp' => date('Y-m-d H:i:s', $payload->get('exp'))
            ]);

            // 3. Vérifier dans le cache
            Log::info('🔍 Vérification dans le cache...');
            $cacheKey = "refresh_token:$jti";
            $cacheExists = Cache::has($cacheKey);

            Log::info('💾 Cache status:', [
                'key' => $cacheKey,
                'exists' => $cacheExists,
                'value' => $cacheExists ? Cache::get($cacheKey) : 'N/A'
            ]);

            if (!$cacheExists) {
                Log::error('❌ ERREUR: Refresh token non trouvé dans le cache (expiré ou invalide)');
                return $this->errorResponse('Refresh token invalide ou expiré', 401);
            }

            // 4. Authentifier l'utilisateur
            Log::info('👤 Authentification de l\'utilisateur...');
            $user = JWTAuth::setToken($refreshToken)->authenticate();
            Log::info('✅ Utilisateur authentifié:', [
                'id' => $user->id,
                'email' => $user->email
            ]);

            // 5. Invalider l'ancien refresh token
            Log::info('🗑️ Suppression de l\'ancien refresh token du cache...');
            Cache::forget($cacheKey);
            Log::info('✅ Ancien token supprimé');

            // 6. Générer les nouveaux tokens
            Log::info('🔨 Génération de nouveaux tokens...');
            $newRefreshToken = $this->generateRefreshToken($user);
            $newAccessToken = $this->generateAccessToken($user);

            Log::info('✅ Nouveaux tokens générés:', [
                'access_token_preview' => substr($newAccessToken, 0, 50) . '...',
                'refresh_token_preview' => substr($newRefreshToken, 0, 50) . '...',
                'expires_in' => JWTAuth::factory()->getTTL() * 60 . ' secondes'
            ]);

            Log::info('✅ ========== REFRESH TOKEN SUCCESS ==========');

            // 7. Retourner la réponse avec le nouveau cookie
            return $this->successResponse([
                'access_token' => $newAccessToken,
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
            ], 'Token rafraîchi')->cookie(
                'refresh_token',
                $newRefreshToken,
                7*24*60,
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );

        } catch (JWTException $e) {
            Log::error('❌ ========== REFRESH TOKEN ERROR ==========');
            Log::error('JWTException:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Refresh token invalide: ' . $e->getMessage(), 401);
        } catch (\Exception $e) {
            Log::error('❌ ========== REFRESH TOKEN ERROR ==========');
            Log::error('Exception générale:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Erreur lors du refresh: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mettre à jour le profil
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'city' => 'nullable|string|max:255',
                'date_of_birth' => 'sometimes|date|before:today'
            ]);

            $user->update($validated);
            $user->load('roles');

            return $this->resourceResponse(
                new UserResource($user),
                'Profil mis à jour avec succès'
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la mise à jour du profil', 500);
        }
    }

    /**
     * Récupérer les professionnels en attente
     */
    public function getPendingProfessionals()
    {
        $users = User::where('is_approved', false)
            ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
            ->with('roles')
            ->get();

        return $this->collectionResponse(
            UserResource::collection($users),
            'Professionnels en attente récupérés'
        );
    }

    /**
     * Récupérer les professionnels approuvés
     */
    public function getApprovedProfessionals()
    {
        $users = User::where('is_approved', true)
            ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
            ->with('roles')
            ->orderBy('approved_at', 'desc')
            ->get();

        return $this->collectionResponse(
            UserResource::collection($users),
            'Professionnels approuvés récupérés'
        );
    }

    /**
     * Récupérer les professionnels rejetés
     */
    public function getRejectedProfessionals()
    {
        $users = User::whereNotNull('rejection_reason')
            ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
            ->with('roles')
            ->get();

        return $this->collectionResponse(
            UserResource::collection($users),
            'Professionnels rejetés récupérés'
        );
    }

    /**
     * Approuver un professionnel
     */
    public function approveProfessional($id)
    {
        try {
            $user = User::findOrFail($id);

            $user->update([
                'is_approved' => true,
                'approved_at' => now(),
                'rejection_reason' => null
            ]);

            // TODO: Envoyer un email de confirmation

            return $this->resourceResponse(
                new UserResource($user->load('roles')),
                'Professionnel approuvé avec succès'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Professionnel non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de l\'approbation', 500);
        }
    }

    /**
     * Rejeter un professionnel
     */
    public function rejectProfessional($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|min:10|max:500'
            ]);

            $user = User::findOrFail($id);

            if (!$user->roles()->where('role', 'professionnel')->exists()) {
                return $this->errorResponse('Cet utilisateur n\'est pas un professionnel', 400);
            }

            $user->update([
                'is_approved' => false,
                'approved_at' => now(),
                'rejection_reason' => $validated['reason']
            ]);

            Log::info("Professionnel rejeté: {$user->email} - Raison: {$validated['reason']}");

            return $this->resourceResponse(
                new UserResource($user->load('roles')),
                'Demande rejetée avec succès'
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Professionnel non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors du rejet', 500);
        }
    }

    /**
     * Récupérer tous les professionnels
     */
    public function getProfessionnels()
    {
        $professionnels = User::whereHas('roles', fn($query) => $query->where('role', 'professionnel'))
            ->with('roles')
            ->get();

        return $this->collectionResponse(
            UserResource::collection($professionnels),
            'Professionnels récupérés'
        );
    }

    /**
     * Récupérer tous les utilisateurs
     */
    public function getUtilisateurs()
    {
        $utilisateurs = User::whereHas('roles', fn($query) => $query->where('role', 'utilisateur'))
            ->withCount('operations')
            ->with('roles')
            ->get();

        return $this->collectionResponse(
            UserResource::collection($utilisateurs),
            'Utilisateurs récupérés'
        );
    }

    /**
     * Basculer le statut actif d'un utilisateur
     */
    public function toggleUserStatus($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->is_active = !$user->is_active;
            $user->save();

            return $this->successResponse(
                ['is_active' => $user->is_active],
                'Statut modifié avec succès'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Utilisateur non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la modification du statut', 500);
        }
    }

    /**
     * Générer un refresh token
     */
   private function generateRefreshToken(User $user): string
    {
        $jti = Str::uuid()->toString();
        Log::info('🎫 Génération refresh token:', [
            'jti' => $jti,
            'user_id' => $user->id,
            'cache_duration' => '7 jours (10080 minutes)'
        ]);

        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);
        Log::info('✅ Refresh token stocké dans le cache');

        return $refreshToken;
    }

    /**
     * Générer un access token
     */
    private function generateAccessToken(User $user): string
    {
        return JWTAuth::claims(['type' => 'access'])->fromUser($user);
    }
}
