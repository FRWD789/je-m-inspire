<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminApprovalController extends Controller
{
    use ApiResponse;

    /**
     * Liste des professionnels avec filtrage
     */
    public function index(Request $request)
    {
        try {
            $status = $request->query('status', 'pending');
            $query = User::whereHas('roles', fn($q) => $q->where('role', 'professionnel'));

            if ($status !== 'all') {
                if ($status === 'pending') {
                    $query->where('is_approved', false)->whereNull('rejection_reason');
                }
                if ($status === 'approved') {
                    $query->where('is_approved', true);
                }
                if ($status === 'rejected') {
                    $query->whereNotNull('rejection_reason');
                }
            }

            $data = $query->with('roles')->get();

            $stats = [
                'pending' => User::where('is_approved', false)
                    ->whereNull('rejection_reason')
                    ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
                    ->count(),
                'approved' => User::where('is_approved', true)
                    ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
                    ->count(),
                'rejected' => User::whereNotNull('rejection_reason')
                    ->whereHas('roles', fn($q) => $q->where('role', 'professionnel'))
                    ->count(),
            ];

            return $this->successResponse([
                'data' => UserResource::collection($data),
                'stats' => $stats
            ], 'Professionnels récupérés avec succès');

        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la récupération des professionnels', 500);
        }
    }

    /**
     * Approuver un professionnel
     */
    public function approve($id)
    {
        try {
            $user = User::findOrFail($id);

            $user->update([
                'is_approved' => true,
                'approved_at' => now(),
                'rejection_reason' => null
            ]);

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
    public function reject($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|min:10'
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }
        
        try {
            $user = User::findOrFail($id);
  
            $user->update([
                'is_approved' => false,
                'rejection_reason' => $validated['reason']
            ]);

            return $this->resourceResponse(
                new UserResource($user->load('roles')),
                'Professionnel rejeté avec succès'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Professionnel non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors du rejet', 500);
        }
    }

    /**
     * Révoquer l'approbation d'un professionnel
     */
    public function revoke($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|min:10'
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            $user = User::findOrFail($id);

            $user->update([
                'is_approved' => false,
                'rejection_reason' => $validated['reason']
            ]);

            return $this->resourceResponse(
                new UserResource($user->load('roles')),
                'Approbation révoquée avec succès'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Professionnel non trouvé');
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la révocation', 500);
        }
    }
}
