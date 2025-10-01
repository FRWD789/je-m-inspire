<?php
namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Operation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class OperationController extends Controller
{
    /**
     * Récupérer les réservations de l'utilisateur
     */
    public function mesReservations()
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $reservations = Operation::with([
                'event.localisation',
                'event.categorie',
                'paiement'
            ])
            ->where('user_id', $user->id)
            ->where('type_operation_id', 2) // Réservations seulement
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($operation) {
                $event = $operation->event;
                $paiement = $operation->paiement;

                // Déterminer le statut de l'événement
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
                    'start_date' => $event->start_date,
                    'end_date' => $event->end_date,
                    'localisation' => $event->localisation->name ?? 'Non spécifié',
                    'categorie' => $event->categorie->name ?? 'Non spécifiée',
                    'quantity' => $operation->quantity,
                    'unit_price' => $event->base_price,
                    'total_price' => $paiement ? $paiement->total : ($operation->quantity * $event->base_price),
                    'statut_paiement' => $paiement ? $paiement->status : 'pending',
                    'statut' => $statut,
                    'date_reservation' => $operation->created_at,
                    'peut_annuler' => $paiement && $paiement->status !== 'paid' || $event->start_date > now()->addHours(24),
                    'event' => $event,
                ];
            });

        $stats = [
            'total_reservations' => $reservations->count(),
            'a_venir' => $reservations->where('statut', 'À venir')->count(),
            'total_places' => $reservations->sum('quantity'),
            'total_depense' => $reservations->where('statut_paiement', 'paid')->sum('total_price')
        ];

        return response()->json([
            'reservations' => $reservations,
            'stats' => $stats
        ]);
    }

    /**
     * Annuler une réservation
     */
    public function destroy($id)
    {
        $user = JWTAuth::user();

        $operation = Operation::with(['event', 'paiement'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->where('type_operation_id', 2) // Seulement les réservations
            ->first();

        if (!$operation) {
            return response()->json(['error' => 'Réservation introuvable'], 404);
        }

        $event = $operation->event;
        $paiement = $operation->paiement;

        // Vérifier si l'annulation est possible
        if ($event->start_date <= now()) {
            return response()->json(['error' => 'Impossible d\'annuler une réservation pour un événement déjà commencé'], 400);
        }

        try {
            DB::beginTransaction();

            // Remettre les places dans l'événement si le paiement était confirmé
            if ($paiement && $paiement->status === 'paid') {
                $event->available_places += $operation->quantity;
                $event->save();
            }

            // Marquer le paiement comme annulé si il existe
            if ($paiement) {
                $paiement->update(['status' => 'cancelled']);
            }

            // Supprimer l'opération
            $operation->delete();

            DB::commit();

            return response()->json(['message' => 'Réservation annulée avec succès']);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de l\'annulation',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une réservation directe (pour compatibilité)
     */
    public function store(Request $request)
    {
        $user = JWTAuth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'type_operation_id' => 'required|in:1,2,3',
            'quantity' => 'required|integer|min:1',
        ]);

        $event = Event::findOrFail($validated['event_id']);

        try {
            DB::beginTransaction();

            // Pour les réservations directes (sans paiement)
            if ($validated['type_operation_id'] == 2) {
                if ($event->available_places < $validated['quantity']) {
                    return response()->json(['error' => 'Pas assez de places disponibles'], 400);
                }

                $event->available_places -= $validated['quantity'];
                $event->save();
            }

            // Création de l'opération
            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => $validated['type_operation_id'],
                'quantity' => $validated['quantity']
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Opération effectuée avec succès',
                'operation' => $operation
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Erreur lors de l\'opération',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
?>
