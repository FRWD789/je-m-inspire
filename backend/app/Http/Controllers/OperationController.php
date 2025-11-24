<?php
// ========================================
// OperationController.php - Version production
// ========================================

namespace App\Http\Controllers;

use App\Http\Resources\OperationResource;
use App\Models\Event;
use App\Models\Operation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

class OperationController extends Controller
{
    use ApiResponse;

    /**
     * Récupérer les réservations de l'utilisateur
     */
    public function mesReservations()
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $reservations = Operation::with([
                    'event.localisation',
                    'event.categorie',
                    'paiement',
                    'remboursement'
                ])
                ->where('user_id', $user->id)
                ->where('type_operation_id', 2)
                ->orderBy('created_at', 'desc')
                ->get()
                ->filter(function ($operation) {
                    // Filtrer les opérations dont l'événement n'existe plus
                    return $operation->event !== null;
                })
                ->map(function ($operation) {
                    $event = $operation->event;
                    $paiement = $operation->paiement;
                    $remboursement = $operation->remboursement;

                    $now = now();
                    $statut = 'À venir';
                    if ($event->start_date <= $now && $event->end_date >= $now) {
                        $statut = 'En cours';
                    } elseif ($event->end_date < $now) {
                        $statut = 'Terminé';
                    }

                    // Vérifier si une demande de remboursement existe et est approuvée
                    $hasApprovedRefund = $remboursement && $remboursement->statut === 'approuve';
                    $hasPendingRefund = $remboursement && $remboursement->statut === 'en_attente';

                    return [
                        'id' => $operation->id,
                        'event_name' => $event->name,
                        'start_date' => $event->start_date->toIso8601String(),
                        'end_date' => $event->end_date->toIso8601String(),
                        'localisation' => $event->localisation->name ?? 'Non spécifié',
                        'categorie' => $event->categorie->name ?? 'Non spécifiée',
                        'unit_price' => (float) $event->base_price,
                        'total_price' => $paiement->total,
                        'statut_paiement' => $paiement ? $paiement->status : 'pending',
                        'statut' => $statut,
                        'date_reservation' => $operation->created_at->toIso8601String(),
                        'peut_annuler' => !$hasApprovedRefund && !$hasPendingRefund && $paiement && $paiement->status === 'paid' && $event->start_date > now()->addHours(24),
                        //'peut_annuler' => !$hasApprovedRefund && !$hasPendingRefund && (($paiement && $paiement->status !== 'paid') || $event->start_date > now()->addHours(24)),
                        'has_refund_request' => $remboursement !== null,
                        'refund_status' => $remboursement ? $remboursement->statut : null,
                        'event' => $event,
                    ];
                });

            $stats = [
                'total_reservations' => $reservations->count(),
                'a_venir' => $reservations->where('statut', 'À venir')->count(),
                'total_depense' => (float) $reservations->where('statut_paiement', 'paid')->sum('total_price')
            ];

            return $this->successResponse([
                'reservations' => $reservations->values(),
                'stats' => $stats
            ], 'Réservations récupérées avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur récupération réservations: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des réservations', 500);
        }
    }

    /**
     * Annuler une réservation
     */
    public function destroy($id)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $operation = Operation::with(['event', 'paiement'])
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->where('type_operation_id', 2)
                ->first();

            if (!$operation) {
                return $this->notFoundResponse('Réservation introuvable');
            }

            $event = $operation->event;
            $paiement = $operation->paiement;

            if ($event->start_date <= now()) {
                return $this->errorResponse('Impossible d\'annuler une réservation pour un événement déjà commencé', 400);
            }

            DB::beginTransaction();

            if ($paiement && $paiement->status === 'paid') {
                $event->available_places += 1;
                $event->save();
            }

            if ($paiement) {
                $paiement->update(['status' => 'cancelled']);
            }

            $operation->delete();

            DB::commit();

            if ($debug) {
                Log::info('Réservation annulée', [
                    'operation_id' => $id,
                    'user_id' => $user->id,
                    'event_id' => $event->id
                ]);
            }

            return $this->successResponse(null, 'Réservation annulée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur annulation réservation: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de l\'annulation', 500);
        }
    }

    /**
     * Créer une réservation directe
     */
    public function store(Request $request)
    {
        $debug = config('app.debug');
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'type_operation_id' => 'required|in:1,2,3',
            ]);

            $event = Event::findOrFail($validated['event_id']);

            DB::beginTransaction();

            if ($validated['type_operation_id'] == 2) {
                if ($event->available_places < 1) {
                    return $this->errorResponse('Pas assez de places disponibles', 400);
                }

                $event->available_places -= 1;
                $event->save();
            }

            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => $validated['type_operation_id'],
            ]);

            DB::commit();

            if ($debug) {
                Log::info('Opération créée', [
                    'operation_id' => $operation->id,
                    'type' => $validated['type_operation_id'],
                    'user_id' => $user->id
                ]);
            }

            return $this->resourceResponse(
                new OperationResource($operation->load(['event', 'user'])),
                'Opération effectuée avec succès',
                201
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création opération: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de l\'opération', 500);
        }
    }
}
