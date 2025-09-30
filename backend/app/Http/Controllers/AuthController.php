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
            // Validation simple
            $request->validate([
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'date_of_birth' => 'required|date|before:today',
                'city' => 'nullable|string|max:255',
                'password' => 'required|string|min:6|confirmed',
                'role' => 'required|string', // Simple: on accepte n'importe quel string
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors(),
            ], 422);
        }

        // Créer l'utilisateur
        $user = User::create([
            'name' => $request->name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'date_of_birth' => $request->date_of_birth,
            'city' => $request->city,
            'password' => Hash::make($request->password),
        ]);

        // Trouver le rôle et l'attacher
        $role = Role::where('role', $request->role)->first();

        if ($role) {
            $user->roles()->attach($role->id);
        } else {
            // Si le rôle n'existe pas, attacher le rôle par défaut "utilisateur"
            $defaultRole = Role::where('role', 'utilisateur')->first();
            if ($defaultRole) {
                $user->roles()->attach($defaultRole->id);
            }
        }

        // Recharger l'utilisateur avec ses rôles
        $user->load('roles');

        // Générer les tokens
        $accessToken = JWTAuth::claims(['type' => 'access'])->fromUser($user);
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
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        try {
            if (!$accessToken = JWTAuth::claims(['type' => 'access'])->attempt($credentials)){
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
            $refreshToken = $this->generateRefreshToken(JWTAuth::user());

        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        $user = JWTAuth::user();
        $user->load('roles');

        // Si tu utilises une relation avec les rôles, charge-les ici
        // $user->load('roles');

        return response()->json([
            'user' => $user,
            'token' => $accessToken,
            'expires_in' => JWTAuth::factory()->getTTL()*60,
            "refresh_token"=> $refreshToken
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
