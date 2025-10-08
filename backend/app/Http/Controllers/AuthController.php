<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redis;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Notifications\ProfessionalApprovedNotification;
use App\Notifications\ProfessionalRejectedNotification;

class AuthController extends Controller
{
    /**
     * Inscription pour les utilisateurs réguliers
     */
    public function registerUser(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'date_of_birth' => 'required|date|before:today',
                'city' => 'nullable|string|max:255',
                'password' => 'required|string|min:6|confirmed',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors(),
            ], 422);
        }

        // Créer l'utilisateur avec approbation automatique
        $user = User::create([
            'name' => $request->name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'date_of_birth' => $request->date_of_birth,
            'city' => $request->city,
            'password' => Hash::make($request->password),
            'is_approved' => true,
            'approved_at' => now(),
            'email_verified_at'=> null,
        ]);

        // Attacher le rôle utilisateur
        $role = Role::where('role', 'utilisateur')->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        $user->load('roles');

        $user->sendEmailVerificationNotification();

        // Générer les tokens
        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);
        $refreshToken = $this->generateRefreshToken($user);


        return response()->json([
            'status' => 'success',
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => $accessToken,
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'refresh_token' => $refreshToken,
            'email_verification_sent' => true
        ])->cookie(
            'refresh_token',
            $refreshToken,
            7*24*60,
            '/',
            null,
            false,
            true
        );
    }

    /**
     * Inscription pour les professionnels (nécessite approbation)
     */
    public function registerProfessional(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'date_of_birth' => 'required|date|before:today',
                'city' => 'nullable|string|max:255',
                'password' => 'required|string|min:6|confirmed',
                'motivation_letter' => 'required|string|min:50|max:2000',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors(),
            ], 422);
        }

        // Créer l'utilisateur sans approbation
        $user = User::create([
            'name' => $request->name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'date_of_birth' => $request->date_of_birth,
            'city' => $request->city,
            'password' => Hash::make($request->password),
            'motivation_letter' => $request->motivation_letter,
            'is_approved' => false,
            'approved_at' => null,
            'email_verified_at' => null
        ]);

        // Attacher le rôle professionnel
        $role = Role::where('role', 'professionnel')->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        $user->load('roles');

        // TODO: Envoyer une notification à l'admin

        return response()->json([
            'status' => 'pending',
            'message' => 'Votre demande d\'inscription a été envoyée. Un administrateur examinera votre candidature.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'is_approved' => false
            ]
        ], 201);
    }

    /**
     * Connexion unique pour tous les utilisateurs
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            // Vérifier que l'email existe
            $user = User::where('email', $credentials['email'])->first();

            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                return response()->json(['error' => 'Identifiants invalides'], 401);
            }

            // Vérifier si approuvé
            if (!$user->is_approved) {
                return response()->json([
                    'error' => 'Votre compte est en attente d\'approbation par un administrateur.'
                ], 403);
            }

            // // Vérifier si le compte est actif
            // if (!$user->is_active) {
            //     return response()->json([
            //         'error' => 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.'
            //     ], 403);
            // }

            // Générer le token JWT
            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)) {
                return response()->json(['error' => 'Échec de l\'authentification'], 401);
            }

            $user->load('roles');
            $refreshToken = $this->generateRefreshToken($user);

            return response()->json([
                'user' => $user,
                'token' => $accessToken,
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'refresh_token' => $refreshToken
            ])->cookie(
                'refresh_token',
                $refreshToken,
                7*24*60,
                '/',
                null,
                false,
                true
            );

        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Impossible de créer le token',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Méthodes admin pour gérer les professionnels
    public function getPendingProfessionals()
    {
        $users = User::where('is_approved', false)
            ->whereNull('rejection_reason')
            ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
            ->with('roles')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function approveProfessional($id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'is_approved' => true,
            'approved_at' => now(),
            'rejection_reason' => null
        ]);

        // ✅ Envoyer un email de confirmation
        try {
            Log::info("Email d'approbation envoyé à: {$user->email}");
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            Log::error("Erreur envoi email approbation: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Professionnel approuvé avec succès',
            'user' => $user
        ]);
    }

    public function rejectProfessional($id, Request $request)
    {
        try {
            $request->validate([
                'reason' => 'required|string|min:10|max:500'
            ]);

            $user = User::findOrFail($id);

            if (!$user->roles()->where('role', 'professionnel')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet utilisateur n\'est pas un professionnel'
                ], 400);
            }

            //envoyer courriel de refus


            // ✅ Envoyer un email de rejet
            try {
                $user->delete();
                Log::info("Email de rejet envoyé à: {$user->email}");
            } catch (\Exception $e) {
                Log::error("Erreur envoi email rejet: " . $e->getMessage());
            }

            Log::info("Professionnel rejeté: {$user->email} - Raison: {$request->reason}");

            return response()->json([
                'success' => true,
                'message' => 'Demande rejetée avec succès',
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->name . ' ' . $user->last_name,
                    'rejection_reason' => $user->rejection_reason
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur rejectProfessional: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du rejet'
            ], 500);
        }
    }

    public function getApprovedProfessionals()
    {
        try {
            $users = User::where('is_approved', true)
                ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
                ->with('roles')
                ->orderBy('approved_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getApprovedProfessionals: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération'
            ], 500);
        }
    }

    public function getRejectedProfessionals()
    {
        try {
            $users = User::where('is_approved', false)
                ->whereNotNull('rejection_reason')
                ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
                ->with('roles')
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getRejectedProfessionals: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération'
            ], 500);
        }
    }

    // Méthodes utilitaires
    private function generateAccessToken(User $user): string
    {
        return JWTAuth::claims(['type' => 'access'])->fromUser($user);
    }

    private function generateRefreshToken(User $user): string
    {
        $jti = Str::uuid()->toString();

        $token = JWTAuth::claims([
            'type' => 'refresh',
            'jti'  => $jti,
            'exp'  => now()->addDays(7)->timestamp,
        ])->fromUser($user);

        Cache::put("refresh_token:$jti", $user->id, now()->addDays(7));

        return $token;
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token');

        if (empty($refreshToken)) {
            return response()->json(['error' => 'Token de rafraîchissement manquant'], 401);
        }

        try {
            $payload = JWTAuth::setToken($refreshToken)->getPayload();

            if ($payload->get('type') !== 'refresh') {
                return response()->json(['error' => 'Type de token invalide'], 401);
            }

            $jti = $payload->get('jti');
            $userId = Cache::get("refresh_token:$jti");

            if (!$userId) {
                return response()->json(['error' => 'Token révoqué ou réutilisé'], 401);
            }

            $user = User::findOrFail($userId);

            Cache::forget("refresh_token:$jti");
            $newRefreshToken = $this->generateRefreshToken($user);
            $newAccessToken  = $this->generateAccessToken($user);

            return response()->json([
                'access_token' => $newAccessToken,
                'expires_in'   => JWTAuth::factory()->getTTL() * 60,
            ])->cookie(
                'refresh_token',
                $newRefreshToken,
                7*24*60,
                '/',
                null,
                false,
                true
            );

        } catch (JWTException $e) {
            return response()->json(['error' => 'Token de rafraîchissement invalide'], 401);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    public function me()
    {
        try {
            $user = JWTAuth::user();
            $user->load('roles');
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token invalide'], 401);
        }
    }

    public function logout(Request $request)
    {
        try {
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                return response()->json(['error' => 'Aucun token de rafraîchissement fourni'], 400);
            }

            $payload = JWTAuth::setToken($refreshToken)->getPayload();
            $jti = $payload->get('jti');
            Cache::forget("refresh_token:$jti");

            return response()
                ->json(['message' => 'Déconnexion réussie'])
                ->cookie('refresh_token', '', -1);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Impossible de se déconnecter',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getProfessionnels()
    {
        $professionnels = User::whereHas('roles', function($query) {
            $query->where('role', 'professionnel');
        })->with('roles')->get();

        return response()->json($professionnels);
    }

    public function getUtilisateurs()
    {
        $utilisateurs = User::whereHas('roles', function($query) {
            $query->where('role', 'utilisateur');
        })
        ->withCount('operations')
        ->with('roles')
        ->get();

        return response()->json($utilisateurs);
    }

    public function toggleUserStatus($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Statut modifié avec succès',
            'is_active' => $user->is_active
        ]);
    }

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

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
