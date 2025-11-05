<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Traits\ApiResponse;
use App\Traits\HandlesProfilePictures;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Notifications\ProfessionalApprovedNotification;
use App\Notifications\ProfessionalRejectedNotification;
use App\Notifications\ProfessionalApplicationReceivedNotification;

class AuthController extends Controller
{
    use ApiResponse, HandlesProfilePictures;

    /**
     * Vérifier le token reCAPTCHA (V2)
     */
    private function verifyRecaptcha($token, $ip)
    {
        Log::info('[reCAPTCHA] === DÉBUT VÉRIFICATION ===', [
            'token_present' => !empty($token),
            'token_length' => $token ? strlen($token) : 0,
            'ip' => $ip,
            'config_site_key' => config('recaptcha.site_key'),
            'config_secret_key' => config('recaptcha.secret_key') ? 'PRÉSENTE' : 'MANQUANTE',
            'verify_url' => config('recaptcha.verify_url')
        ]);

        if (!$token) {
            Log::error('[reCAPTCHA] Token manquant');
            return false;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::asForm()->post(config('recaptcha.verify_url'), [
                'secret' => config('recaptcha.secret_key'),
                'response' => $token,
                'remoteip' => $ip
            ]);

            $result = $response->json();

            Log::info('[reCAPTCHA] Réponse Google', [
                'success' => $result['success'] ?? false,
                'error_codes' => $result['error-codes'] ?? [],
                'challenge_ts' => $result['challenge_ts'] ?? null
            ]);

            return $result['success'] ?? false;
        } catch (\Exception $e) {
            Log::error('[reCAPTCHA] Exception', [
                'message' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Inscription pour les utilisateurs réguliers (V2)
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
                'profile_picture' => 'nullable|file|max:2048',
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            $profilePicturePath = null;

            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');

                // Vérification manuelle du type MIME
                $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/avif'];

                if (!in_array($file->getMimeType(), $allowedMimes)) {
                    return $this->validationErrorResponse([
                        'profile_picture' => ['Le fichier doit être une image (JPEG, PNG, GIF, WebP ou AVIF)']
                    ]);
                }

                $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $profilePicturePath = $file->storeAs('profile_pictures', $filename, 'public');

                Log::info('[Auth] Image de profil uploadée lors de l\'inscription', [
                    'filename' => $filename,
                    'path' => $profilePicturePath,
                    'mime' => $file->getMimeType()
                ]);
            }

            if (!$this->verifyRecaptcha($request->input('recaptcha_token'), $request->ip())) {
                return $this->errorResponse('Validation reCAPTCHA échouée', 422);
            }

            $user = User::create([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'date_of_birth' => $validated['date_of_birth'],
                'city' => $validated['city'] ?? null,
                'password' => Hash::make($validated['password']),
                'profile_picture' => $profilePicturePath,
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
            Log::error('[Auth] Erreur inscription utilisateur: ' . $e->getMessage());

            if (isset($profilePicturePath) && Storage::disk('public')->exists($profilePicturePath)) {
                Storage::disk('public')->delete($profilePicturePath);
            }

            return $this->errorResponse('Erreur lors de l\'inscription', 500);
        }
    }

    /**
     * Inscription pour les professionnels (nécessite approbation) (V2)
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
                'profile_picture' => 'nullable|file|max:2048',
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            $profilePicturePath = null;

            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');

                // Vérification manuelle du type MIME
                $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/avif'];

                if (!in_array($file->getMimeType(), $allowedMimes)) {
                    return $this->validationErrorResponse([
                        'profile_picture' => ['Le fichier doit être une image (JPEG, PNG, GIF, WebP ou AVIF)']
                    ]);
                }

                $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $profilePicturePath = $file->storeAs('profile_pictures', $filename, 'public');

                Log::info('[Auth] Image de profil uploadée lors de l\'inscription pro', [
                    'filename' => $filename,
                    'path' => $profilePicturePath,
                    'mime' => $file->getMimeType()
                ]);
            }

            if (!$this->verifyRecaptcha($request->input('recaptcha_token'), $request->ip())) {
                return $this->errorResponse('Validation reCAPTCHA échouée', 422);
            }

            $user = User::create([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'date_of_birth' => $validated['date_of_birth'],
                'city' => $validated['city'] ?? null,
                'password' => Hash::make($validated['password']),
                'motivation_letter' => $validated['motivation_letter'],
                'profile_picture' => $profilePicturePath,
                'is_approved' => false,
                'approved_at' => null,
            ]);

            $role = Role::where('role', 'professionnel')->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            $user->load('roles');

            $user->notify(new ProfessionalApplicationReceivedNotification());
            Log::info('[Professional] Email d\'accusé envoyé', ['user_id' => $user->id]);

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
            Log::error('[Auth] Erreur inscription professionnel: ' . $e->getMessage());

            if (isset($profilePicturePath) && Storage::disk('public')->exists($profilePicturePath)) {
                Storage::disk('public')->delete($profilePicturePath);
            }

            return $this->errorResponse('Erreur lors de l\'inscription', 500);
        }
    }

    /**
     * Connexion (V2)
     */
    public function login(Request $request)
    {
        $debug = config('app.debug');

        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            // if (!$this->verifyRecaptcha($request->input('recaptcha_token'), $request->ip())) {
            //     return $this->errorResponse('Validation reCAPTCHA échouée', 422);
            // }

            $user = User::where('email', $credentials['email'])->first();

            if (!$user) {
                return $this->errorResponse('Identifiants invalides', 401);
            }

            if (!$user->is_approved) {
                return $this->errorResponse('Compte en attente d\'approbation', 403);
            }

            // if ($user->last_login_at) {
            //     $daysInactive = now()->diffInDays($user->last_login_at);

            //     if ($daysInactive > 90) {
            //         if (!$user->hasRole('admin')) {
            //             $user->is_active = false;
            //             $user->save();

            //             Log::warning('[Inactivity] Compte désactivé lors de la tentative de connexion', [
            //                 'user_id' => $user->id,
            //                 'email' => $user->email,
            //                 'last_login' => $user->last_login_at,
            //                 'days_inactive' => $daysInactive
            //             ]);

            //             return $this->errorResponse(
            //                 'Votre compte a été désactivé en raison d\'une inactivité de plus de 90 jours. Veuillez contacter le support.',
            //                 403
            //             );
            //         }
            //     }
            // }
            // if (!$user->is_active) {
            //     return $this->errorResponse('Votre compte est désactivé. Veuillez contacter le support.', 403);
            // }
            // try {
            //     $user->notify(new \App\Notifications\AccountDeactivatedNotification($daysInactive));
            //     Log::info('[Inactivity] Email de désactivation envoyé', ['user_id' => $user->id]);
            // } catch (\Exception $e) {
            //     Log::error('[Inactivity] Erreur envoi email: ' . $e->getMessage());
            // }

            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)) {
                return $this->errorResponse('Identifiants invalides', 401);
            }

            $user->last_login_at = now();
            $user->save();

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
                7*24*60,
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );

        } catch (JWTException $e) {
            Log::error('Erreur JWT login: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la connexion', 500);
        }
    }

    /**
     * Obtenir l'utilisateur authentifié (V2)
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
     * Déconnexion (V2)
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
            Log::error('Erreur logout: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la déconnexion', 500);
        }
    }

    /**
     * Rafraîchir le token (V2)
     */
    public function refresh(Request $request)
    {
        $debug = config('app.debug');

        if ($debug) {
            Log::info('🔄 ========== REFRESH TOKEN START ==========');
        }

        try {
            $refreshToken = $request->cookie('refresh_token');

            if ($debug) {
                Log::info('🍪 Cookie refresh_token:', [
                    'exists' => !empty($refreshToken),
                    'preview' => $refreshToken ? substr($refreshToken, 0, 50) . '...' : 'NULL'
                ]);
            }

            if (!$refreshToken) {
                if ($debug) {
                    Log::error('❌ ERREUR: Refresh token manquant');
                }
                return $this->errorResponse('Refresh token manquant', 401);
            }

            if ($debug) {
                Log::info('🔓 Décodage du refresh token...');
            }

            $payload = JWTAuth::setToken($refreshToken)->getPayload();
            $jti = $payload->get('jti');
            $userId = $payload->get('sub');

            if ($debug) {
                Log::info('✅ Token décodé:', [
                    'jti' => $jti,
                    'user_id' => $userId,
                    'type' => $payload->get('type'),
                    'exp' => date('Y-m-d H:i:s', $payload->get('exp'))
                ]);

                Log::info('🔍 Vérification dans le cache...');
            }

            $cacheKey = "refresh_token:$jti";
            $cacheExists = Cache::has($cacheKey);

            if ($debug) {
                Log::info('💾 Cache status:', [
                    'key' => $cacheKey,
                    'exists' => $cacheExists,
                    'value' => $cacheExists ? Cache::get($cacheKey) : 'N/A'
                ]);
            }

            if (!$cacheExists) {
                if ($debug) {
                    Log::error('❌ ERREUR: Refresh token non trouvé dans le cache');
                }
                return $this->errorResponse('Refresh token invalide ou expiré', 401);
            }

            if ($debug) {
                Log::info('👤 Authentification de l\'utilisateur...');
            }

            $user = JWTAuth::setToken($refreshToken)->authenticate();
            $user->load('roles');

            if ($debug) {
                Log::info('✅ Utilisateur authentifié:', [
                    'id' => $user->id,
                    'email' => $user->email
                ]);

                Log::info('🗑️ Suppression de l\'ancien refresh token...');
            }

            Cache::forget($cacheKey);

            if ($debug) {
                Log::info('✅ Ancien token supprimé');
                Log::info('🔨 Génération de nouveaux tokens...');
            }

            $newRefreshToken = $this->generateRefreshToken($user);
            $newAccessToken = $this->generateAccessToken($user);

            if ($debug) {
                Log::info('✅ Nouveaux tokens générés:', [
                    'access_token_preview' => substr($newAccessToken, 0, 50) . '...',
                    'refresh_token_preview' => substr($newRefreshToken, 0, 50) . '...',
                    'expires_in' => JWTAuth::factory()->getTTL() * 60 . ' secondes'
                ]);

                Log::info('✅ ========== REFRESH TOKEN SUCCESS ==========');
            }

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
            Log::error('Erreur JWT refresh:', ['message' => $e->getMessage()]);
            return $this->errorResponse('Refresh token invalide', 401);
        } catch (\Exception $e) {
            Log::error('Erreur refresh:', ['message' => $e->getMessage()]);
            return $this->errorResponse('Erreur lors du refresh', 500);
        }
    }

    /**
     * Mettre à jour le mot de passe (V2)
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Mot de passe actuel incorrect', 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return $this->successResponse(null, 'Mot de passe mis à jour avec succès');
    }

    /**
     * Mettre à jour l'image de profil (V2)
     */
    public function updateProfileImg(Request $request)
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'profile_picture' => 'nullable|file|max:2048',
            ]);

            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');

                // Vérification manuelle du type MIME
                $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/avif'];

                if (!in_array($file->getMimeType(), $allowedMimes)) {
                    return $this->validationErrorResponse([
                        'profile_picture' => ['Le fichier doit être une image (JPEG, PNG, GIF, WebP ou AVIF)']
                    ]);
                }

                // Supprimer l'ancienne image si elle existe
                if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                    Storage::disk('public')->delete($user->profile_picture);
                    Log::info('[Auth] Ancienne image de profil supprimée', [
                        'user_id' => $user->id,
                        'old_path' => $user->profile_picture
                    ]);
                }

                // Uploader la nouvelle image
                $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
                $profilePicturePath = $file->storeAs('profile_pictures', $filename, 'public');

                $validated['profile_picture'] = $profilePicturePath;

                Log::info('[Auth] Nouvelle image de profil uploadée', [
                    'user_id' => $user->id,
                    'filename' => $filename,
                    'path' => $profilePicturePath
                ]);
            }

            $user->update($validated);
            $user->load('roles');

            return $this->resourceResponse(
                new UserResource($user),
                'Profil mis à jour avec succès'
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('[Auth] Erreur lors de la mise à jour du profil: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la mise à jour du profil', 500);
        }
    }

    /**
     * Mettre à jour le profil (V2)
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
                'date_of_birth' => 'sometimes|date|before:today',
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
            Log::error('[Auth] Erreur lors de la mise à jour du profil: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la mise à jour du profil', 500);
        }
    }

    /**
     * Compléter l'onboarding utilisateur (Document 1)
     */
    public function onboarding(Request $request)
    {
        try {
            $user = Auth::user();

            // Validate incoming data
            $validated = $request->validate([
                'biography' => 'nullable|string|max:1000',
                'profile_picture' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
            ]);

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                try {
                    // Delete old image if exists
                    $this->deleteProfilePicture($user->profile_picture);

                    // Upload new one
                    $validated['profile_picture'] = $this->uploadProfilePicture(
                        $request->file('profile_picture'),
                        $user->id
                    );
                } catch (\Exception $e) {
                    return $this->validationErrorResponse([
                        'profile_picture' => [$e->getMessage()]
                    ]);
                }
            }

            // Update biography if provided
            if (isset($validated['biography'])) {
                $user->biography = $validated['biography'];
            }

            // Mark onboarding as completed
            $user->onboarding_completed = true;
            $user->save();
            $user->load('roles');

            return $this->resourceResponse(
                new UserResource($user),
                'Onboarding complété avec succès'
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('[Auth] Erreur onboarding: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors du onboarding', 500);
        }
    }

    /**
     * Ignorer l'onboarding (Document 1)
     */
    public function skipOnboarding()
    {
        try {
            $user = Auth::user();
            $user->onboarding_skipped = true;
            $user->save();

            return $this->successResponse(
                ['user' => new UserResource($user)],
                'Onboarding ignoré avec succès'
            );
        } catch (\Exception $e) {
            Log::error('[Auth] Erreur skip onboarding: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors du skip onboarding', 500);
        }
    }

    /**
     * Récupérer les professionnels en attente (V2)
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
     * Récupérer les professionnels approuvés (V2)
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
     * Approuver un professionnel (V2)
     */
    public function approveProfessional($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->is_approved = true;
            $user->approved_at = now();
            $user->save();

            return $this->successResponse(
                ['user' => new UserResource($user)],
                'Professionnel approuvé avec succès'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Utilisateur non trouvé');
        } catch (\Exception $e) {
            Log::error('Erreur approbation: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de l\'approbation', 500);
        }
    }

    /**
     * Rejeter un professionnel (V2)
     */
    public function rejectProfessional($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return $this->successResponse(
                null,
                'Professionnel rejeté avec succès'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Utilisateur non trouvé');
        } catch (\Exception $e) {
            Log::error('Erreur rejet: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors du rejet', 500);
        }
    }

    /**
     * Récupérer les utilisateurs réguliers (V2)
     */
    public function getUsers()
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
     * Basculer le statut actif d'un utilisateur (V2)
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
            Log::error('Erreur toggle status: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la modification du statut', 500);
        }
    }

    /**
     * Générer un refresh token (V2)
     */
    private function generateRefreshToken(User $user): string
    {
        $debug = config('app.debug');

        $jti = Str::uuid()->toString();

        if ($debug) {
            Log::info('🎫 Génération refresh token:', [
                'jti' => $jti,
                'user_id' => $user->id,
                'cache_duration' => '7 jours'
            ]);
        }

        $refreshToken = JWTAuth::claims([
            'type' => 'refresh',
            'jti' => $jti
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, 7*24*60);

        if ($debug) {
            Log::info('✅ Refresh token stocké dans le cache');
        }

        return $refreshToken;
    }

    /**
     * Générer un access token (V2)
     */
    private function generateAccessToken(User $user): string
    {
        return JWTAuth::claims(['type' => 'access'])->fromUser($user);
    }
}
