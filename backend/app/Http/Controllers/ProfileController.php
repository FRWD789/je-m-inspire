<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Affichage du profil', [
                    'user_id' => $user->id,
                    'user_type' => $user->user_type
                ]);
            }

            return response()->json([
                'success' => true,
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'affichage du profil', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement du profil'
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Mise à jour du profil', [
                    'user_id' => $user->id,
                    'data' => $request->except(['password', 'password_confirmation'])
                ]);
            }

            $validatedData = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone' => 'sometimes|string|max:20',
                'address' => 'sometimes|string|max:500',
                'bio' => 'sometimes|string|max:1000',
            ]);

            $user->update($validatedData);

            if ($debug) {
                Log::info('Profil mis à jour avec succès', [
                    'user_id' => $user->id
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du profil', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil'
            ], 500);
        }
    }

    public function updateAvatar(Request $request)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Début de mise à jour de l\'avatar', [
                    'user_id' => $user->id
                ]);
            }

            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            // Supprimer l'ancien avatar si existant
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);

                if ($debug) {
                    Log::info('Ancien avatar supprimé', [
                        'user_id' => $user->id,
                        'old_avatar' => $user->avatar
                    ]);
                }
            }

            // Sauvegarder le nouvel avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
            $user->save();

            if ($debug) {
                Log::info('Avatar mis à jour avec succès', [
                    'user_id' => $user->id,
                    'new_avatar' => $path
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Avatar mis à jour avec succès',
                'avatar_url' => Storage::url($path)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de l\'avatar', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'avatar'
            ], 500);
        }
    }

    public function deleteAvatar()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
                $user->avatar = null;
                $user->save();

                if ($debug) {
                    Log::info('Avatar supprimé', [
                        'user_id' => $user->id
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Avatar supprimé avec succès'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Aucun avatar à supprimer'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de l\'avatar', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'avatar'
            ], 500);
        }
    }
}
