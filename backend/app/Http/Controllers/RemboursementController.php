<?php

namespace App\Http\Controllers;

use App\Http\Resources\RemboursementResource;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Remboursement;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Notifications\RemboursementReceivedNotification;
use App\Notifications\RemboursementApprovedNotification;
use App\Notifications\RemboursementRejectedNotification;

class RemboursementController extends Controller
{
    use ApiResponse;

    /**
     * Créer une demande de remboursement
     */
    public function store(Request $request)
    {
        $debug = config('app.debug');

        try {
            $validated = $request->validate([
                'operation_id' => 'required|exists:operations,id',
                'motif' => 'required|string|max:500',
                'montant' => 'required|numeric|min:0.01'
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            DB::beginTransaction();

            $operation = Operation::with(['event', 'paiement'])
                ->findOrFail($validated['operation_id']);

            if ($operation->user_id !== Auth::id()) {
                return $this->unauthorizedResponse('Cette opération ne vous appartient pas');
            }

            if (!$operation->paiement || $operation->paiement->status !== 'paid') {
                return $this->errorResponse('Seules les réservations payées peuvent être remboursées', 400);
            }

            $existingRemboursement = Remboursement::where('operation_id', $validated['operation_id'])
                ->whereIn('statut', ['en_attente', 'approuve'])
                ->first();

            if ($existingRemboursement) {
                return $this->errorResponse('Une demande de remboursement existe déjà pour cette réservation', 400);
            }

            $montantMax = $operation->paiement->total;

            if ($validated['montant'] > $montantMax) {
                return $this->errorResponse("Le montant demandé ne peut pas dépasser {$montantMax} CAD", 400);
            }

            $remboursement = Remboursement::create([
                'user_id' => Auth::id(),
                'operation_id' => $validated['operation_id'],
                'montant' => $validated['montant'],
                'motif' => $validated['motif'],
                'statut' => 'en_attente'
            ]);

            DB::commit();

            $remboursement->load(['operation.event']);

            // Envoyer la notification à l'utilisateur
            $remboursement->load(['operation.event', 'user']);
            $remboursement->user->notify(new RemboursementReceivedNotification($remboursement));

            Log::info('[Remboursement] Demande créée et email envoyé', [
                'remboursement_id' => $remboursement->id,
                'user_id' => Auth::id(),
                'montant' => $remboursement->montant,
            ]);

            if ($debug) {
                Log::info('[Remboursement] Demande créée', [
                    'remboursement_id' => $remboursement->id,
                    'user_id' => Auth::id(),
                    'montant' => $validated['montant']
                ]);
            }

            return $this->resourceResponse(
                new RemboursementResource($remboursement->load(['user', 'operation.event'])),
                'Demande de remboursement créée avec succès',
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Remboursement] Erreur création: ' . $e->getMessage());
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
                ->with(['user', 'operation.event'])
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->collectionResponse(
                RemboursementResource::collection($demandes),
                'Demandes de remboursement récupérées'
            );

        } catch (\Exception $e) {
            Log::error('[Remboursement] Erreur récupération demandes: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des demandes', 500);
        }
    }

    /**
     * Voir les remboursements selon le rôle
     * Admin: remboursements avec commission indirecte uniquement
     * Pro: remboursements avec commission directe de ses événements
     */
    public function index()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            // Vérifier si admin
            $isAdmin = $user->roles()->where('role', 'admin')->exists();

            if ($isAdmin) {
                // Admin voit uniquement les remboursements INDIRECTS
                $remboursements = Remboursement::with([
                    'user',
                    'operation.event',
                    'operation.paiement.commission.vendor'
                ])
                ->whereHas('operation.paiement.commission', function($query) {
                    $query->where('type', 'indirect');
                })
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($remboursement) {
                    $operation = $remboursement->operation;
                    $paiement = $operation->paiement;
                    $commission = $paiement->commission;
                    $vendor = $commission->vendor;

                    return [
                        'id' => $remboursement->id,
                        'date' => $remboursement->created_at->format('Y-m-d H:i:s'),
                        'evenement' => $operation->event->name ?? 'N/A',
                        'client' => $remboursement->user->name . ' ' . $remboursement->user->last_name,
                        'vendeur' => $vendor->name . ' ' . $vendor->last_name,
                        'courriel' => $remboursement->user->email,
                        'motif' => $remboursement->motif,
                        'message' => $remboursement->commentaire_admin ?? '',
                        'montant' => (float) $remboursement->montant,
                        'statut' => $remboursement->statut,
                        'date_traitement' => $remboursement->date_traitement?->format('Y-m-d H:i:s'),
                    ];
                });

                if ($debug) {
                    Log::info('[Remboursement] Remboursements admin (indirects)', [
                        'user_id' => $user->id,
                        'count' => $remboursements->count()
                    ]);
                }

                return $this->successResponse([
                    'data' => $remboursements,
                    'total' => $remboursements->count(),
                    'type' => 'admin'
                ]);

            } else {
                // Professionnel voit uniquement les remboursements DIRECTS de ses événements
                $eventIds = Operation::where('user_id', $user->id)
                    ->where('type_operation_id', 1)
                    ->pluck('event_id')
                    ->toArray();

                if (empty($eventIds)) {
                    return $this->successResponse([
                        'data' => [],
                        'total' => 0,
                        'type' => 'pro',
                        'message' => 'Aucun événement créé'
                    ]);
                }

                $remboursements = Remboursement::with([
                    'user',
                    'operation.event',
                    'operation.paiement.commission.vendor'
                ])
                ->whereHas('operation', function($query) use ($eventIds) {
                    $query->whereIn('event_id', $eventIds);
                })
                ->whereHas('operation.paiement.commission', function($query) {
                    $query->where('type', 'direct');
                })
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($remboursement) {
                    $operation = $remboursement->operation;
                    $paiement = $operation->paiement;
                    $commission = $paiement->commission;
                    $vendor = $commission->vendor;

                    return [
                        'id' => $remboursement->id,
                        'date' => $remboursement->created_at->format('Y-m-d H:i:s'),
                        'evenement' => $operation->event->name ?? 'N/A',
                        'client' => $remboursement->user->name . ' ' . $remboursement->user->last_name,
                        'vendeur' => $vendor->name . ' ' . $vendor->last_name,
                        'courriel' => $remboursement->user->email,
                        'motif' => $remboursement->motif,
                        'message' => $remboursement->commentaire_admin ?? '',
                        'montant' => (float) $remboursement->montant,
                        'statut' => $remboursement->statut,
                        'date_traitement' => $remboursement->date_traitement?->format('Y-m-d H:i:s'),
                    ];
                });

                if ($debug) {
                    Log::info('[Remboursement] Remboursements pro (directs)', [
                        'user_id' => $user->id,
                        'count' => $remboursements->count(),
                        'events_count' => count($eventIds)
                    ]);
                }

                return $this->successResponse([
                    'data' => $remboursements,
                    'total' => $remboursements->count(),
                    'type' => 'pro'
                ]);
            }

        } catch (\Exception $e) {
            Log::error('[Remboursement] Erreur récupération remboursements: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des remboursements', 500);
        }
    }

    /**
     * Traiter une demande de remboursement (Admin ou Pro)
     */
    public function traiter(Request $request, $id)
    {
        $debug = config('app.debug');

        try {
            $validated = $request->validate([
                'statut' => 'required|in:approuve,refuse',
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
                $event->available_places += 1;
                $event->save();

                if ($remboursement->operation->paiement) {
                    $remboursement->operation->paiement->update(['status' => 'refunded']);
                }

                if ($debug) {
                    Log::info('[Remboursement] Demande approuvée', [
                        'remboursement_id' => $remboursement->id,
                        'montant' => $remboursement->montant,
                        'user_id' => $remboursement->user_id
                    ]);
                }

                $remboursement->load(['user', 'operation.event', 'operation.paiement']);
                $remboursement->user->notify(new \App\Notifications\RemboursementApprovedNotification($remboursement));

                Log::info('[Remboursement] Email d\'approbation envoyé', [
                    'remboursement_id' => $remboursement->id,
                    'user_id' => $remboursement->user_id,
                ]);

            } else {
                if ($debug) {
                    Log::info('[Remboursement] Demande refusée', [
                        'remboursement_id' => $remboursement->id,
                        'user_id' => $remboursement->user_id,
                        'raison' => $validated['commentaire_admin'] ?? 'Non spécifiée'
                    ]);
                }

                $remboursement->load(['user', 'operation.event', 'operation.paiement']);
                $remboursement->user->notify(new \App\Notifications\RemboursementRejectedNotification($remboursement));

                Log::info('[Remboursement] Email de refus envoyé', [
                    'remboursement_id' => $remboursement->id,
                    'user_id' => $remboursement->user_id,
                ]);
            }

            DB::commit();

            $message = $validated['statut'] === 'approuve'
                ? 'Demande de remboursement approuvée'
                : 'Demande de remboursement refusée';

            return $this->resourceResponse(
                new RemboursementResource($remboursement->load(['user', 'operation.event'])),
                $message
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Demande de remboursement non trouvée');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Remboursement] Erreur traitement: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors du traitement de la demande', 500);
        }
    }
}
