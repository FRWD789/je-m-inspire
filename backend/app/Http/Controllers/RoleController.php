<?php

namespace App\Http\Controllers;

use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    use ApiResponse;

    /**
     * Récupérer tous les rôles
     */
    public function index()
    {
        try {
            $roles = config('roles');

            if (!$roles) {
                return $this->notFoundResponse('Aucun rôle configuré');
            }

            $rolesFormatted = array_map(function($key, $role) {
                return [
                    'id' => $key + 1,
                    'role' => $role['role'],
                    'description' => $role['description'] ?? $role['role']
                ];
            }, array_keys($roles), array_values($roles));

            return $this->successResponse(
                $rolesFormatted,
                'Rôles récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Impossible de récupérer les rôles', 500);
        }
    }

    /**
     * Afficher un rôle spécifique
     */
    public function show($id)
    {
        try {
            $role = Role::findOrFail($id);

            return $this->resourceResponse(
                new RoleResource($role),
                'Rôle récupéré'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Rôle non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la récupération du rôle', 500);
        }
    }

    /**
     * Créer un nouveau rôle (admin uniquement)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'role' => 'required|string|max:255|unique:roles',
                'description' => 'nullable|string|max:500',
            ]);

            $role = Role::create($validated);

            return $this->resourceResponse(
                new RoleResource($role),
                'Rôle créé avec succès',
                201
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Impossible de créer le rôle', 500);
        }
    }

    /**
     * Mettre à jour un rôle (admin uniquement)
     */
    public function update(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            $validated = $request->validate([
                'role' => 'required|string|max:255|unique:roles,role,' . $id,
                'description' => 'nullable|string|max:500',
            ]);

            $role->update($validated);

            return $this->resourceResponse(
                new RoleResource($role),
                'Rôle mis à jour avec succès'
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Rôle non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Impossible de mettre à jour le rôle', 500);
        }
    }

    /**
     * Supprimer un rôle (admin uniquement)
     */
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);

            if ($role->users()->count() > 0) {
                return $this->errorResponse(
                    'Impossible de supprimer un rôle assigné à des utilisateurs',
                    422
                );
            }

            $role->delete();

            return $this->successResponse(null, 'Rôle supprimé avec succès');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Rôle non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Impossible de supprimer le rôle', 500);
        }
    }
}
