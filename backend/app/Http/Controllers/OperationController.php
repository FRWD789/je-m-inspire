<?php

namespace App\Http\Controllers;

use App\Http\Resources\OperationResource;
use App\Models\Event;
use App\Models\Operation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                    'paiement'
                ])
                ->where('user_id', $user->id)
                ->where('type_operation_id', 2)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($operation) {
                    $event = $operation->event;
                    $paiement = $operation->paiement;

                    $now = now();
                    $statut = 'À venir';
                    if ($event->start_date <= $now && $event->end_date >= $now) {
                        $statut = 'En cours';
                    } elseif ($event->end_date < $now) {
                        $statut = 'Terminé';
                    }

                    return [
                        'id' => $operation->id,
                        'event_name' => $event->name,
                        'start_date' => $event->start_date->toIso8601String(),
                        'end_date' => $event->end_date->toIso8601String(),
                        'localisation' => $event->localisation->name ?? 'Non spécifié',
                        'categorie' => $event->categorie->name ?? 'Non spécifiée',
                        'quantity' => $operation->quantity,
                        'unit_price' => (float) $event->base_price,
                        'total_price' => $paiement ? (float) $paiement->total : ($operation->quantity * $event->base_price),
                        'statut_paiement' => $paiement ? $paiement->status : 'pending',
                        'statut' => $statut,
                        'date_reservation' => $operation->created_at->toIso8601String(),
                        'peut_annuler' => ($paiement && $paiement->status !== 'paid') || $event->start_date > now()->addHours(24),
                        'event' => $event,
                    ];
                });

            $stats = [
                'total_reservations' => $reservations->count(),
                'a_venir' => $reservations->where('statut', 'À venir')->count(),
                'total_places' => $reservations->sum('quantity'),
                'total_depense' => (float) $reservations->where('statut_paiement', 'paid')->sum('total_price')
            ];

            return $this->successResponse([
                'reservations' => $reservations->values(),
                'stats' => $stats
            ], 'Réservations récupérées avec succès');

        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la récupération des réservations', 500);
        }
    }

    /**
     * Annuler une réservation
     */
    public function destroy($id)
    {
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
                $event->available_places += $operation->quantity;
                $event->save();
            }

            if ($paiement) {
                $paiement->update(['status' => 'cancelled']);
            }

            $operation->delete();

            DB::commit();

            return $this->successResponse(null, 'Réservation annulée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Erreur lors de l\'annulation', 500);
        }
    }

    /**
     * Créer une réservation directe
     */
    public function store(Request $request)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'type_operation_id' => 'required|in:1,2,3',
                'quantity' => 'required|integer|min:1',
            ]);

            $event = Event::findOrFail($validated['event_id']);

            DB::beginTransaction();

            if ($validated['type_operation_id'] == 2) {
                if ($event->available_places < $validated['quantity']) {
                    return $this->errorResponse('Pas assez de places disponibles', 400);
                }

                $event->available_places -= $validated['quantity'];
                $event->save();
            }

            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => $validated['type_operation_id'],
                'quantity' => $validated['quantity']
            ]);

            DB::commit();

            return $this->resourceResponse(
                new OperationResource($operation->load(['event', 'user'])),
                'Opération effectuée avec succès',
                201
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Erreur lors de l\'opération', 500);
        }
    }
}
