<?php
namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Operation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventController extends Controller
{
    /**
     * Liste tous les événements
     */
    public function index()
    {
        $events = Event::with(['localisation', 'categorie'])
            ->where('start_date', '>', now()) // Seulement les événements futurs
            ->orderBy('start_date')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'description' => $event->description,
                    'start_date' => $event->start_date,
                    'end_date' => $event->end_date,
                    'base_price' => $event->base_price,
                    'available_places' => $event->available_places,
                    'max_places' => $event->max_places,
                    'level' => $event->level,
                    'priority' => $event->priority,
                    'localisation' => [
                        'id' => $event->localisation->id,
                        'name' => $event->localisation->name,
                        'address' => $event->localisation->address,
                    ],
                    'categorie' => [
                        'id' => $event->categorie->id,
                        'name' => $event->categorie->name,
                    ],
                    'can_reserve' => $event->available_places > 0 && $event->start_date > now(),
                ];
            });

        return response()->json([
            'events' => $events,
            'total' => $events->count(),
        ]);
    }

    /**
     * Créer un événement (professionnels uniquement)
     */
    public function store(Request $request)
    {
        $user = JWTAuth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Vérifier le rôle professionnel
        if (!$user->hasRole('professionnel') && !$user->hasRole('admin')) {
            return response()->json([
                'error' => 'Seuls les professionnels peuvent créer des événements'
            ], 403);
        }

        // Validation des champs
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'start_date' => 'required|date|after_or_equal:now',
            'end_date' => 'required|date|after:start_date',
            'base_price' => 'required|numeric|min:0|max:9999.99',
            'capacity' => 'required|integer|min:1|max:10000',
            'max_places' => 'required|integer|min:1|max:10000',
            'level' => 'required|string|max:50',
            'priority' => 'required|integer|min:1|max:10',
            'localisation_id' => 'required|exists:localisations,id',
            'categorie_event_id' => 'required|exists:categorie_events,id',
        ]);

        // Vérifier que capacity <= max_places
        if ($validated['capacity'] > $validated['max_places']) {
            return response()->json([
                'error' => 'La capacité ne peut pas dépasser le nombre maximum de places'
            ], 422);
        }

        $validated['available_places'] = $validated['max_places'];

        try {
            DB::beginTransaction();

            // Créer l'événement
            $event = Event::create($validated);

            // Créer l'opération associée (création d'événement)
            Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 1, // Type "Creation Evenement"
                'quantity' => 0, // Pas de places pour une création
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Événement créé avec succès',
                'event' => $event->load(['localisation', 'categorie'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de la création de l\'événement',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un événement spécifique
     */
    public function show($id)
    {
        $event = Event::with(['localisation', 'categorie'])->find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Événement non trouvé'
            ], 404);
        }

        // Calculer les statistiques de réservation
        $totalReserved = Operation::where('event_id', $event->id)
            ->where('type_operation_id', 2) // Réservations
            ->whereHas('paiement', function($query) {
                $query->where('status', 'paid');
            })
            ->sum('quantity');

        return response()->json([
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'base_price' => $event->base_price,
                'available_places' => $event->available_places,
                'max_places' => $event->max_places,
                'reserved_places' => $totalReserved,
                'level' => $event->level,
                'priority' => $event->priority,
                'localisation' => [
                    'id' => $event->localisation->id,
                    'name' => $event->localisation->name,
                    'address' => $event->localisation->address,
                    'latitude' => $event->localisation->latitude,
                    'longitude' => $event->localisation->longitude,
                ],
                'categorie' => [
                    'id' => $event->categorie->id,
                    'name' => $event->categorie->name,
                    'description' => $event->categorie->description,
                ],
                'can_reserve' => $event->available_places > 0 && $event->start_date > now(),
                'is_past' => $event->end_date < now(),
                'is_ongoing' => $event->start_date <= now() && $event->end_date >= now(),
            ]
        ]);
    }

    /**
     * Mes événements créés (pour les professionnels)
     */
    public function myEvents()
    {
        $user = JWTAuth::user();

        if (!$user->hasRole('professionnel') && !$user->hasRole('admin')) {
            return response()->json([
                'error' => 'Accès réservé aux professionnels'
            ], 403);
        }

        // Récupérer les événements créés par l'utilisateur
        $events = Event::with(['localisation', 'categorie'])
            ->whereHas('operation', function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->where('type_operation_id', 1); // Type "Creation Evenement"
            })
            ->withCount(['operations as total_reservations' => function($query) {
                $query->where('type_operation_id', 2)
                      ->whereHas('paiement', function($q) {
                          $q->where('status', 'paid');
                      });
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($event) {
                // Calculer le chiffre d'affaires
                $revenue = Operation::where('event_id', $event->id)
                    ->where('type_operation_id', 2)
                    ->whereHas('paiement', function($query) {
                        $query->where('status', 'paid');
                    })
                    ->with('paiement')
                    ->get()
                    ->sum(function($operation) {
                        return $operation->paiement ? $operation->paiement->total : 0;
                    });

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'start_date' => $event->start_date,
                    'end_date' => $event->end_date,
                    'base_price' => $event->base_price,
                    'available_places' => $event->available_places,
                    'max_places' => $event->max_places,
                    'localisation' => $event->localisation->name,
                    'categorie' => $event->categorie->name,
                    'total_reservations' => $event->total_reservations,
                    'revenue' => $revenue,
                    'status' => $event->start_date > now() ? 'À venir' :
                               ($event->end_date < now() ? 'Terminé' : 'En cours'),
                ];
            });

        return response()->json([
            'events' => $events,
            'summary' => [
                'total_events' => $events->count(),
                'upcoming_events' => $events->where('status', 'À venir')->count(),
                'total_revenue' => $events->sum('revenue'),
                'total_reservations' => $events->sum('total_reservations'),
            ]
        ]);
    }

    /**
     * Modifier un événement
     */
    public function update(Request $request, $id)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Événement non trouvé'], 404);
        }

        // Vérifier que l'utilisateur est le créateur
        $isOwner = $event->operation()
            ->where('user_id', $user->id)
            ->where('type_operation_id', 1) // Type "Creation Evenement"
            ->exists();

        if (!$isOwner && !$user->hasRole('admin')) {
            return response()->json([
                'error' => 'Vous ne pouvez modifier que vos propres événements'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string|max:2000',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'base_price' => 'sometimes|required|numeric|min:0|max:9999.99',
            'capacity' => 'sometimes|required|integer|min:1|max:10000',
            'max_places' => 'sometimes|required|integer|min:1|max:10000',
            'level' => 'sometimes|required|string|max:50',
            'priority' => 'sometimes|required|integer|min:1|max:10',
            'localisation_id' => 'sometimes|required|exists:localisations,id',
            'categorie_event_id' => 'sometimes|required|exists:categorie_events,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        // Si max_places est modifié, ajuster available_places
        if (isset($validated['max_places'])) {
            $currentReservations = $event->max_places - $event->available_places;
            $validated['available_places'] = $validated['max_places'] - $currentReservations;

            // S'assurer que available_places n'est pas négatif
            if ($validated['available_places'] < 0) {
                return response()->json([
                    'error' => 'Le nouveau nombre de places maximum est insuffisant par rapport aux réservations existantes'
                ], 400);
            }
        }

        try {
            $event->update($validated);

            return response()->json([
                'message' => 'Événement modifié avec succès',
                'event' => $event->load(['localisation', 'categorie'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la modification',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un événement
     */
    public function destroy($id)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Événement non trouvé'], 404);
        }

        // Vérifier que l'utilisateur est le créateur
        $isOwner = $event->operation()
            ->where('user_id', $user->id)
            ->where('type_operation_id', 1) // Type "Creation Evenement"
            ->exists();

        if (!$isOwner && !$user->hasRole('admin')) {
            return response()->json([
                'error' => 'Vous ne pouvez supprimer que vos propres événements'
            ], 403);
        }

        // Vérifier s'il y a des réservations confirmées
        $hasConfirmedReservations = Operation::where('event_id', $event->id)
            ->where('type_operation_id', 2)
            ->whereHas('paiement', function($query) {
                $query->where('status', 'paid');
            })
            ->exists();

        if ($hasConfirmedReservations) {
            return response()->json([
                'error' => 'Impossible de supprimer un événement avec des réservations confirmées'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Supprimer toutes les opérations liées (réservations non confirmées)
            Operation::where('event_id', $event->id)->delete();

            // Supprimer l'événement
            $event->delete();

            DB::commit();

            return response()->json([
                'message' => 'Événement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de la suppression',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
?>
