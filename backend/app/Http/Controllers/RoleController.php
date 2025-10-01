<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Afficher la liste de tous les rôles
     */
   /**
     * Récupérer les rôles depuis le fichier config/roles.php
     */
    public function index()
    {
        try {
            $roles = config('roles');

            if (!$roles) {
                return response()->json([
                    'error' => 'Aucun rôle configuré'
                ], 404);
            }

            // Convertir en format attendu par le frontend
            $rolesFormatted = array_map(function($key, $role) {
                return [
                    'id' => $key + 1, // ID numérique pour le frontend
                    'role' => $role['role'],
                    'description' => $role['description'] ?? $role['role']
                ];
            }, array_keys($roles), array_values($roles));

            return response()->json($rolesFormatted, 200, [
                'Content-Type' => 'application/json'
            ]);

        } catch (\Exception $e) {


            return response()->json([
                'error' => 'Impossible de récupérer les rôles',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un rôle spécifique
     */
    public function show($id)
    {
        try {
            $role = Role::findOrFail($id);
            return response()->json($role);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Rôle non trouvé'
            ], 404);
        }
    }

    /**
     * Créer un nouveau rôle (admin uniquement)
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'role' => 'required|string|max:255|unique:roles',
                'description' => 'nullable|string|max:500',
            ]);

            $role = Role::create([
                'role' => $request->role,
                'description' => $request->description,
            ]);

            return response()->json($role, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Impossible de créer le rôle',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un rôle (admin uniquement)
     */
    public function update(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            $request->validate([
                'role' => 'required|string|max:255|unique:roles,role,' . $id,
                'description' => 'nullable|string|max:500',
            ]);

            $role->update([
                'role' => $request->role,
                'description' => $request->description,
            ]);

            return response()->json($role);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Impossible de mettre à jour le rôle',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un rôle (admin uniquement)
     */
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);

            // Vérifier que le rôle n'est pas utilisé par des utilisateurs
            if ($role->users()->count() > 0) {
                return response()->json([
                    'error' => 'Impossible de supprimer ce rôle car il est utilisé par des utilisateurs'
                ], 422);
            }

            $role->delete();

            return response()->json([
                'message' => 'Rôle supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Impossible de supprimer le rôle',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
