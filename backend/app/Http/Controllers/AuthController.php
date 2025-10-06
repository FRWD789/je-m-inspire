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
class AuthController extends Controller
{
    public function register(Request $request){
        try {
            $validationRules = [
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'date_of_birth' => 'required|date|before:today',
                'city' => 'nullable|string|max:255',
                'password' => 'required|string|min:6|confirmed',
                'role' => 'required|string|in:utilisateur,professionnel',
            ];

            // Ajouter la validation de motivation pour les professionnels
            if ($request->role === 'professionnel') {
                $validationRules['motivation_letter'] = 'required|string|min:50|max:2000';
            }

            $request->validate($validationRules);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors(),
            ], 422);
        }

        // Déterminer le statut d'approbation
        $isApproved = $request->role === 'utilisateur';

        // Créer l'utilisateur
        $user = User::create([
            'name' => $request->name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'date_of_birth' => $request->date_of_birth,
            'city' => $request->city,
            'password' => Hash::make($request->password),
            'motivation_letter' => $request->motivation_letter ?? null,
            'is_approved' => $isApproved,
            'approved_at' => $isApproved ? now() : null,
        ]);

        // Attacher le rôle
        $role = Role::where('role', $request->role)->first();
        if ($role) {
            $user->roles()->attach($role->id);
        } else {
            $defaultRole = Role::where('role', 'utilisateur')->first();
            if ($defaultRole) {
                $user->roles()->attach($defaultRole->id);
            }
        }

        $user->load('roles');

        // Si professionnel, retourner un message différent
        if ($request->role === 'professionnel') {
            return response()->json([
                'status' => 'pending',
                'message' => 'Votre demande d\'inscription a été envoyée. Un administrateur examinera votre candidature.',
                'user' => $user
            ], 201);
        }

        // Pour utilisateur normal, générer les tokens
        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);
        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'status' => 'success',
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
    }

    // Ajouter dans login pour vérifier l'approbation
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            // Vérifier que l'email existe
            $user = User::where('email', $credentials['email'])->first();

            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            // Vérifier si approuvé
            if (!$user->is_approved) {
                return response()->json([
                    'error' => 'Votre compte est en attente d\'approbation par un administrateur.'
                ], 403);
            }

            // Ici seulement on génère le token JWT
            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
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
                'error' => 'Could not create token',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    // Ajouter méthodes pour l'admin
    public function getPendingProfessionals()
    {
        $users = User::where('is_approved', false)
            ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
            ->get();

        return response()->json($users);
    }


    public function approveProfessional($id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'is_approved' => true,
            'approved_at' => now()
        ]);

        // Optionnel: envoyer un email de confirmation

        return response()->json([
            'message' => 'Professionnel approuvé avec succès',
            'user' => $user
        ]);
    }

// AuthController.php - Modifiez cette méthode existante

    public function rejectProfessional($id, Request $request)
    {
        try {
            // Valider la raison du rejet
            $request->validate([
                'reason' => 'required|string|min:10|max:500'
            ]);

            $user = User::findOrFail($id);

            // Vérifier que c'est bien un professionnel
            if (!$user->roles()->where('role', 'professionnel')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet utilisateur n\'est pas un professionnel'
                ], 400);
            }

            // Mettre à jour avec la raison du rejet
            $user->update([
                'is_approved' => false,
                'approved_at' => now(),
                'rejection_reason' => $request->reason
            ]);

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

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Erreur rejectProfessional: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du rejet'
            ], 500);
        }
    }

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
            return response()->json(['error' => 'No refresh token provided',"refreshToken"=>$refreshToken], 401);
        }

        try {
            $payload = JWTAuth::setToken($refreshToken)->getPayload();

            if ($payload->get('type') !== 'refresh') {
                return response()->json(['error' => 'Invalid token type'], 401);
            }

            $jti = $payload->get('jti');
            $userId = Cache::get("refresh_token:$jti");

            if (!$userId) {
                return response()->json(['error' => 'Refresh token revoked or reused'], 401);
            }
            $user = User::findOrFail($userId);

            Cache::forget("refresh_token:$jti");
            $newRefreshToken = $this->generateRefreshToken($user);
            $newAccessToken  = $this->generateAccessToken($user);

            return response()->json([
                "refreshToken"=>$refreshToken,
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
            return response()->json(['error' => 'Invalid refresh token'], 401);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function me()
    {
        try {
            $user = JWTAuth::user();
            $user->load('roles');
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token invalid'], 401);
        }
    }

    public function logout(Request $request){
        try {
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                return response()->json(['error' => 'No refresh token provided'], 400);
            }
            $payload = JWTAuth::setToken($refreshToken)->getPayload();
            $jti = $payload->get('jti');
            Cache::forget("refresh_token:$jti");
            return response()
                ->json(['message' => 'Logged out successfully'])
                ->cookie('refresh_token', '', -1);

         } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not log out',
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

        return response()->json(['message' => 'Statut modifié avec succès']);
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
    // AuthController.php - Ajoutez ces méthodes

/**
 * Récupérer les professionnels approuvés
 */
    public function getApprovedProfessionals()
    {
        try {
            $users = User::where('is_approved', true)
                ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
                ->with('roles')
                ->orderBy('approved_at', 'desc')
                ->get()
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->name . ' ' . $user->last_name,
                        'email' => $user->email,
                        'city' => $user->city,
                        'date_of_birth' => $user->date_of_birth,
                        'created_at' => $user->created_at,
                        'approved_at' => $user->approved_at,
                        'is_approved' => true,
                        'rejection_reason' => null
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getApprovedProfessionals: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des professionnels approuvés'
            ], 500);
        }
    }

/**
 * Récupérer les professionnels rejetés
 */
    public function getRejectedProfessionals()
    {
        try {
            $users = User::where('is_approved', false)
                ->whereNotNull('rejection_reason')
                ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
                ->with('roles')
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'last_name' => $user->last_name,
                        'full_name' => $user->name . ' ' . $user->last_name,
                        'email' => $user->email,
                        'city' => $user->city,
                        'date_of_birth' => $user->date_of_birth,
                        'created_at' => $user->created_at,
                        'approved_at' => $user->approved_at,
                        'is_approved' => false,
                        'rejection_reason' => $user->rejection_reason
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getRejectedProfessionals: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des professionnels rejetés'
            ], 500);
        }
    }
    }
