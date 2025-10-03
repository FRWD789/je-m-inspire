<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Localisation;
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
                        'lat' => $event->localisation->latitude,
                        'lng' => $event->localisation->longitude,

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
            'localisation_address' => 'required|string|max:255',
            'localisation_lat' => 'required|numeric|between:-90,90',
            'localisation_lng' => 'required|numeric|between:-180,180',
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

            // ✅ CRÉER OU RÉCUPÉRER LA LOCALISATION
            // Vérifier si une localisation existe déjà avec ces coordonnées (dans un rayon de ~10m)
            $existingLocalisation = Localisation::where(function($query) use ($validated) {
                $query->whereBetween('latitude', [
                    $validated['localisation_lat'] - 0.0001,
                    $validated['localisation_lat'] + 0.0001
                ])
                ->whereBetween('longitude', [
                    $validated['localisation_lng'] - 0.0001,
                    $validated['localisation_lng'] + 0.0001
                ]);
            })->first();

            if ($existingLocalisation) {
                // Utiliser la localisation existante
                $localisation = $existingLocalisation;
            } else {
                // Créer une nouvelle localisation
                $localisation = Localisation::create([
                    'name' => substr($validated['localisation_address'], 0, 100), // Nom basé sur l'adresse
                    'address' => $validated['localisation_address'],
                    'latitude' => $validated['localisation_lat'],
                    'longitude' => $validated['localisation_lng'],
                ]);
            }

            // ✅ CRÉER L'ÉVÉNEMENT AVEC LA LOCALISATION
            $eventData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'base_price' => $validated['base_price'],
                'capacity' => $validated['capacity'],
                'max_places' => $validated['max_places'],
                'available_places' => $validated['available_places'],
                'level' => $validated['level'],
                'priority' => $validated['priority'],
                'localisation_id' => $localisation->id,
                'categorie_event_id' => $validated['categorie_event_id'],
            ];

            $event = Event::create($eventData);

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
                'event' => $event->load(['localisation', 'categorie']),
                'localisation' => $localisation
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
     * Réserver des places pour un événement
     */
    public function reserve(Request $request, $eventId)
    {
        $user = JWTAuth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Validation de la quantité
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:10'
        ]);

        try {
            DB::beginTransaction();

            // Récupérer l'événement avec un verrou pour éviter les conditions de course
            $event = Event::lockForUpdate()->find($eventId);

            if (!$event) {
                return response()->json(['error' => 'Événement non trouvé'], 404);
            }

            // Vérifier si l'événement est encore disponible à la réservation
            if ($event->start_date <= now()) {
                return response()->json([
                    'error' => 'Impossible de réserver pour un événement passé ou en cours'
                ], 422);
            }

            // Vérifier la disponibilité des places
            if ($event->available_places < $validated['quantity']) {
                return response()->json([
                    'error' => 'Places insuffisantes disponibles',
                    'available_places' => $event->available_places,
                    'requested_quantity' => $validated['quantity']
                ], 422);
            }

            // Vérifier si l'utilisateur a déjà une réservation pour cet événement
            $existingReservation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2 // Supposons que 2 = "Reservation"
            ])->first();

            if ($existingReservation) {
                return response()->json([
                    'error' => 'Vous avez déjà une réservation pour cet événement'
                ], 422);
            }

            // Mettre à jour les places disponibles
            $event->available_places -= $validated['quantity'];
            $event->save();

            // Créer l'opération de réservation
            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2, // Type "Reservation"
                'quantity' => $validated['quantity'],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Réservation effectuée avec succès',
                'operation' => $operation,
                'event' => $event->load(['localisation', 'categorie']),
                'remaining_places' => $event->available_places
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de la réservation',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les événements de l'utilisateur connecté
     */
    public function myEvents()
    {
        $user = JWTAuth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        try {
            // Récupérer les événements basés sur les opérations directement
            $userOperations = Operation::where('user_id', $user->id)->get();

            // Récupérer les IDs des événements où l'utilisateur a des opérations
            $eventIds = $userOperations->pluck('event_id')->unique();

            // Récupérer les événements concernés
            $events = Event::with(['localisation', 'categorie'])
                ->whereIn('id', $eventIds)
                ->orderBy('start_date')
                ->get();

            // Séparer les événements créés et réservés
            $createdEvents = collect();
            $reservedEvents = collect();

            foreach ($events as $event) {
                $userOpsForEvent = $userOperations->where('event_id', $event->id);

                // Vérifier si l'utilisateur a créé l'événement (type_operation_id = 1)
                $isCreator = $userOpsForEvent->where('type_operation_id', 1)->isNotEmpty();

                // Récupérer TOUTES les réservations (type_operation_id = 2)
                $reservationOps = $userOpsForEvent->where('type_operation_id', 2);

                $eventData = [
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

                if ($isCreator) {
                    $createdEvents->push(array_merge($eventData, [
                        'is_creator' => true,
                        'is_reserved' => false,
                        'user_role' => 'creator'
                    ]));
                }

                // Ajouter UNE ENTRÉE PAR RÉSERVATION
                foreach ($reservationOps as $reservationOp) {
                    $reservedEvents->push(array_merge($eventData, [
                        'is_creator' => false,
                        'is_reserved' => true,
                        'operation_id' => $reservationOp->id,
                        'user_role' => 'participant'
                    ]));
                }
            }

            return response()->json([
                'events' => $createdEvents->merge($reservedEvents)->values(),
                'created_events' => $createdEvents->values(),
                'reserved_events' => $reservedEvents->values(),
                'total' => $createdEvents->count() + $reservedEvents->count(),
                'total_created' => $createdEvents->count(),
                'total_reserved' => $reservedEvents->count(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des événements',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les détails d'un événement
     */
    public function show($id)
    {
        $event = Event::with(['localisation', 'categorie'])->find($id);

        if (!$event) {
            return response()->json(['error' => 'Événement non trouvé'], 404);
        }

        $eventData = [
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

        return response()->json(['event' => $eventData]);
    }

    /**
     * Annuler une réservation
     */
    public function cancelReservation($eventId)
    {
        $user = JWTAuth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        try {
            DB::beginTransaction();

            // Trouver la réservation
            $operation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2 // Type "Reservation"
            ])->first();

            if (!$operation) {
                return response()->json([
                    'error' => 'Aucune réservation trouvée pour cet événement'
                ], 404);
            }

            // Récupérer l'événement
            $event = Event::lockForUpdate()->find($eventId);

            // Vérifier si l'annulation est encore possible (par exemple, 24h avant)
            if ($event->start_date <= now()->addHours(24)) {
                return response()->json([
                    'error' => 'Impossible d\'annuler moins de 24h avant l\'événement'
                ], 422);
            }

            // Remettre les places disponibles
            $event->available_places += $operation->quantity;
            $event->save();

            // Supprimer l'opération de réservation
            $operation->delete();

            DB::commit();

            return response()->json([
                'message' => 'Réservation annulée avec succès',
                'restored_places' => $operation->quantity
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de l\'annulation',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un événement (créateur ou admin uniquement)
     */
    public function destroy($id)
    {
        $user = JWTAuth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        try {
            DB::beginTransaction();

            $event = Event::find($id);
            if (!$event) {
                return response()->json(['error' => 'Événement non trouvé'], 404);
            }

            // Vérifier les permissions : admin ou créateur de l'événement
            $isAdmin = $user->hasRole('admin');
            $isCreator = false;

            // Vérifier si l'utilisateur est le créateur via les opérations
            $creationOperation = Operation::where([
                'event_id' => $id,
                'user_id' => $user->id,
                'type_operation_id' => 1 // Type "Creation Evenement"
            ])->exists();

            if ($creationOperation) {
                $isCreator = true;
            }

            if (!$isAdmin && !$isCreator) {
                return response()->json([
                    'error' => 'Vous n\'êtes pas autorisé à supprimer cet événement'
                ], 403);
            }

            // Vérifier s'il y a des réservations actives
            $activeReservations = Operation::where([
                'event_id' => $id,
                'type_operation_id' => 2 // Type "Reservation"
            ])->count();

            if ($activeReservations > 0) {
                return response()->json([
                    'error' => 'Impossible de supprimer un événement avec des réservations actives',
                    'active_reservations' => $activeReservations
                ], 422);
            }

            // Supprimer toutes les opérations liées à l'événement
            Operation::where('event_id', $id)->delete();

            // Supprimer l'événement
            $event->delete();

            DB::commit();

            return response()->json([
                'message' => 'Événement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de la suppression de l\'événement',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un événement (créateur ou admin uniquement)
     */
    public function update(Request $request, $id)
    {
        $user = JWTAuth::user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        try {
            $event = Event::find($id);
            if (!$event) {
                return response()->json(['error' => 'Événement non trouvé'], 404);
            }

            // Vérifier les permissions
            $isAdmin = $user->hasRole('admin');
            $isCreator = Operation::where([
                'event_id' => $id,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isAdmin && !$isCreator) {
                return response()->json([
                    'error' => 'Vous n\'êtes pas autorisé à modifier cet événement'
                ], 403);
            }

            // Validation des champs (similaire à store mais avec des règles moins strictes)
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|max:2000',
                'start_date' => 'sometimes|date|after_or_equal:now',
                'end_date' => 'sometimes|date|after:start_date',
                'base_price' => 'sometimes|numeric|min:0|max:9999.99',
                'max_places' => 'sometimes|integer|min:1|max:10000',
                'level' => 'sometimes|string|max:50',
                'priority' => 'sometimes|integer|min:1|max:10',
                'localisation_id' => 'sometimes|exists:localisations,id',
                'categorie_event_id' => 'sometimes|exists:categorie_events,id',
            ]);

            // Si on modifie max_places, vérifier la cohérence
            if (isset($validated['max_places'])) {
                $reservedPlaces = $event->max_places - $event->available_places;
                if ($validated['max_places'] < $reservedPlaces) {
                    return response()->json([
                        'error' => 'Le nouveau nombre maximum de places ne peut pas être inférieur aux places déjà réservées',
                        'reserved_places' => $reservedPlaces
                    ], 422);
                }
                $validated['available_places'] = $validated['max_places'] - $reservedPlaces;
            }

            // Mettre à jour l'événement
            $event->update($validated);

            return response()->json([
                'message' => 'Événement mis à jour avec succès',
                'event' => $event->load(['localisation', 'categorie'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour de l\'événement',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
