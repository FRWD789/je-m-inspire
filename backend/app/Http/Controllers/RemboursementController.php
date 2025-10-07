<?php

namespace App\Http\Controllers;

use App\Http\Resources\RemboursementResource;
use App\Models\Remboursement;
use App\Models\Operation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RemboursementController extends Controller
{
    use ApiResponse;

    /**
     * Créer une demande de remboursement
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'operation_id' => 'required|exists:operations,id',
                'motif' => 'required|string|min:10',
                'montant' => 'required|numeric|min:0.01'
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        $user = Auth::user();

        try {
            $operation = Operation::with('paiement')
                ->where('id', $validated['operation_id'])
                ->where('user_id', $user->id)
                ->firstOrFail();

            if (!$operation->paiement) {
                return $this->errorResponse('Cette réservation n\'a pas de paiement associé', 400);
            }

            if ($operation->paiement->status !== 'paid') {
                return $this->errorResponse('Seules les réservations payées peuvent être remboursées', 400);
            }

            $demandeExistante = Remboursement::where('operation_id', $operation->id)
                ->where('statut', 'en_attente')
                ->first();

            if ($demandeExistante) {
                return $this->errorResponse('Une demande de remboursement est déjà en cours pour cette réservation', 400);
            }

            $montantPaiement = floatval($operation->paiement->total);
            $montantDemande = floatval($validated['montant']);

            if (abs($montantPaiement - $montantDemande) > 0.01) {
                return $this->errorResponse('Le montant demandé ne correspond pas au montant payé', 400);
            }

            $remboursement = Remboursement::create([
                'user_id' => $user->id,
                'operation_id' => $operation->id,
                'montant' => $montantPaiement,
                'motif' => $validated['motif'],
                'statut' => 'en_attente'
            ]);

            return $this->resourceResponse(
                new RemboursementResource($remboursement->load('operation.event')),
                'Demande de remboursement créée avec succès',
                201
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Réservation non trouvée');
        } catch (\Exception $e) {
            Log::error('Erreur création remboursement: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création de la demande', 500);
        }
    }

    /**
     * Voir mes demandes de remboursement
     */
    public function mesDemandes()
    {
        try {
            $demandes = Remboursement::where('user_id', Auth::id())
                ->with('operation.event')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->collectionResponse(
                RemboursementResource::collection($demandes),
                'Demandes de remboursement récupérées'
            );

        } catch (\Exception $e) {
            Log::error('Erreur récupération demandes: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des demandes', 500);
        }
    }

    /**
     * Voir toutes les demandes (Admin)
     */
    public function index()
    {
        try {
            $demandes = Remboursement::with(['user', 'operation.event'])
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->collectionResponse(
                RemboursementResource::collection($demandes),
                'Toutes les demandes de remboursement récupérées'
            );

        } catch (\Exception $e) {
            Log::error('Erreur récupération toutes demandes: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des demandes', 500);
        }
    }

    /**
     * Traiter une demande de remboursement (Admin)
     */
    public function traiter(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'statut' => 'required|in:approuve,rejete',
                'commentaire_admin' => 'nullable|string|max:500'
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            DB::beginTransaction();

            $remboursement = Remboursement::with(['operation.event', 'operation.paiement'])
                ->findOrFail($id);

            if ($remboursement->statut !== 'en_attente') {
                return $this->errorResponse('Cette demande a déjà été traitée', 400);
            }

            $remboursement->update([
                'statut' => $validated['statut'],
                'commentaire_admin' => $validated['commentaire_admin'] ?? null,
                'date_traitement' => now()
            ]);

            if ($validated['statut'] === 'approuve') {
                $event = $remboursement->operation->event;
                $event->available_places += $remboursement->operation->quantity;
                $event->save();

                if ($remboursement->operation->paiement) {
                    $remboursement->operation->paiement->update(['status' => 'refunded']);
                }

                Log::info('Remboursement approuvé', [
                    'remboursement_id' => $remboursement->id,
                    'montant' => $remboursement->montant,
                    'user_id' => $remboursement->user_id
                ]);
            }

            DB::commit();

            $message = $validated['statut'] === 'approuve'
                ? 'Demande de remboursement approuvée'
                : 'Demande de remboursement rejetée';

            return $this->resourceResponse(
                new RemboursementResource($remboursement->load(['user', 'operation.event'])),
                $message
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Demande de remboursement non trouvée');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur traitement remboursement: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors du traitement de la demande', 500);
        }
    }
}
