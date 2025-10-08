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
                $event->available_places += $operation->quantity;
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

// ========================================
// CommissionController.php - Version production
// ========================================

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CommissionController extends Controller
{
    use ApiResponse;

    /**
     * Récupérer tous les professionnels avec leur taux de commission
     */
    public function index()
    {
        try {
            $professionals = User::whereHas('roles', function ($query) {
                $query->where('role', 'professionnel');
            })
            ->with('roles')
            ->select('id', 'name', 'last_name', 'email', 'commission_rate', 'stripeAccount_id', 'paypalAccount_id')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'commission_rate' => (float) ($user->commission_rate ?? 0),
                    'has_stripe' => !empty($user->stripeAccount_id),
                    'has_paypal' => !empty($user->paypalAccount_id),
                ];
            });

            return $this->successResponse([
                'data' => $professionals,
                'total' => $professionals->count()
            ], 'Professionnels récupérés avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur récupération professionnels: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération des professionnels', 500);
        }
    }

    /**
     * Mettre à jour le taux de commission d'un utilisateur
     */
    public function update(Request $request, $id)
    {
        $debug = config('app.debug');

        $validator = Validator::make($request->all(), [
            'commission_rate' => 'required|numeric|min:0|max:100'
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors()->toArray());
        }

        try {
            $user = User::findOrFail($id);

            if (!$user->roles()->where('role', 'professionnel')->exists()) {
                return $this->errorResponse('Cet utilisateur n\'est pas un professionnel', 400);
            }

            $oldRate = $user->commission_rate;
            $user->commission_rate = $request->commission_rate;
            $user->save();

            if ($debug) {
                Log::info("Commission mise à jour", [
                    'user_id' => $user->id,
                    'old_rate' => $oldRate,
                    'new_rate' => $user->commission_rate
                ]);
            }

            return $this->successResponse([
                'id' => $user->id,
                'full_name' => $user->name . ' ' . $user->last_name,
                'email' => $user->email,
                'commission_rate' => (float) $user->commission_rate
            ], 'Taux de commission mis à jour avec succès');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Utilisateur non trouvé');
        } catch (\Exception $e) {
            Log::error('Erreur update commission: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la mise à jour', 500);
        }
    }
}
