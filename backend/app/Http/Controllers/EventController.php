<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Http\Resources\EventCollection;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Localisation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventController extends Controller
{
    use ApiResponse;

    /**
     * Liste tous les événements futurs
     */
   public function index()
    {
        $events = Event::with(['localisation', 'categorie'])
            ->where('start_date', '>', now())
            ->orderBy('start_date')
            ->get();

        return $this->collectionResponse(
            EventResource::collection($events),
            'Événements récupérés avec succès'
        );
    }

    /**
     * Afficher un événement
     */
    public function show($id)
    {
        // ✅ Charger TOUTES les relations nécessaires
        $event = Event::with(['localisation', 'categorie', 'creator.roles'])->find($id);

        if (!$event) {
            return $this->notFoundResponse('Événement non trouvé');
        }

        return $this->resourceResponse(
            new EventResource($event),
            'Événement récupéré'
        );
    }

    /**
     * Créer un événement (professionnels uniquement)
     */
   public function store(Request $request)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        if (!$user->hasRole('professionnel') && !$user->hasRole('admin')) {
            return $this->unauthorizedResponse('Seuls les professionnels peuvent créer des événements');
        }

        // ✅ LOGIQUE INCHANGÉE
        try {
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
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        // ✅ LOGIQUE INCHANGÉE
        if ($validated['capacity'] > $validated['max_places']) {
            return $this->errorResponse('La capacité ne peut pas dépasser le nombre maximum de places', 422);
        }

        $validated['available_places'] = $validated['max_places'];

        try {
            DB::beginTransaction();

            // ✅ LOGIQUE INCHANGÉE
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
                $localisation = $existingLocalisation;
            } else {
                $localisation = Localisation::create([
                    'name' => substr($validated['localisation_address'], 0, 100),
                    'address' => $validated['localisation_address'],
                    'latitude' => $validated['localisation_lat'],
                    'longitude' => $validated['localisation_lng'],
                ]);
            }

            // ✅ LOGIQUE INCHANGÉE
            $event = Event::create([
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
            ]);

            // ✅ LOGIQUE INCHANGÉE
            Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 1,
                'quantity' => 0,
            ]);

            DB::commit();

            // ✅ SEULEMENT LE RETURN MODIFIÉ
            return $this->resourceResponse(
                new EventResource($event->load(['localisation', 'categorie'])),
                'Événement créé avec succès',
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Erreur lors de la création de l\'événement', 500);
        }
    }

    /**
     * Mettre à jour un événement
     */
    public function update(Request $request, $id)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $event = Event::find($id);

            if (!$event) {
                return $this->notFoundResponse('Événement non trouvé');
            }

            $isAdmin = $user->hasRole('admin');
            $isCreator = Operation::where([
                'event_id' => $id,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isAdmin && !$isCreator) {
                return $this->unauthorizedResponse('Vous n\'êtes pas autorisé à modifier cet événement');
            }

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

            if (isset($validated['max_places'])) {
                $reservedPlaces = $event->max_places - $event->available_places;
                if ($validated['max_places'] < $reservedPlaces) {
                    return $this->errorResponse(
                        'Le nouveau nombre maximum de places ne peut pas être inférieur aux places déjà réservées',
                        422
                    );
                }
                $validated['available_places'] = $validated['max_places'] - $reservedPlaces;
            }

            $event->update($validated);

            return $this->resourceResponse(
                new EventResource($event->load(['localisation', 'categorie'])),
                'Événement mis à jour avec succès'
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la mise à jour de l\'événement', 500);
        }
    }

    /**
     * Supprimer un événement
     */
    public function destroy($id)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            DB::beginTransaction();

            $event = Event::find($id);

            if (!$event) {
                return $this->notFoundResponse('Événement non trouvé');
            }

            $isAdmin = $user->hasRole('admin');
            $creationOperation = Operation::where([
                'event_id' => $id,
                'user_id' => $user->id,
                'type_operation_id' => 1
            ])->exists();

            if (!$isAdmin && !$creationOperation) {
                return $this->unauthorizedResponse('Vous n\'êtes pas autorisé à supprimer cet événement');
            }

            $activeReservations = Operation::where([
                'event_id' => $id,
                'type_operation_id' => 2
            ])->count();

            if ($activeReservations > 0) {
                return $this->errorResponse(
                    'Impossible de supprimer un événement avec des réservations actives',
                    422
                );
            }

            Operation::where('event_id', $id)->delete();
            $event->delete();

            DB::commit();

            return $this->successResponse(null, 'Événement supprimé avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Erreur lors de la suppression de l\'événement', 500);
        }
    }

    /**
     * Réserver des places pour un événement
     */
    public function reserve(Request $request, $eventId)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1|max:10'
            ]);
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        }

        try {
            DB::beginTransaction();

            $event = Event::lockForUpdate()->find($eventId);

            if (!$event) {
                return $this->notFoundResponse('Événement non trouvé');
            }

            if ($event->start_date <= now()) {
                return $this->errorResponse('Impossible de réserver pour un événement passé ou en cours', 422);
            }

            if ($event->available_places < $validated['quantity']) {
                return $this->errorResponse('Places insuffisantes disponibles', 422);
            }

            $existingReservation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2
            ])->first();

            if ($existingReservation) {
                return $this->errorResponse('Vous avez déjà une réservation pour cet événement', 422);
            }

            $event->available_places -= $validated['quantity'];
            $event->save();

            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2,
                'quantity' => $validated['quantity'],
            ]);

            DB::commit();

            return $this->successResponse([
                'operation' => $operation,
                'event' => new EventResource($event->load(['localisation', 'categorie'])),
                'remaining_places' => $event->available_places
            ], 'Réservation effectuée avec succès', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Erreur lors de la réservation', 500);
        }
    }

    /**
     * Annuler une réservation
     */
    public function cancelReservation($eventId)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            DB::beginTransaction();

            $operation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $eventId,
                'type_operation_id' => 2
            ])->first();

            if (!$operation) {
                return $this->notFoundResponse('Aucune réservation trouvée pour cet événement');
            }

            $event = Event::lockForUpdate()->find($eventId);

            if ($event->start_date <= now()->addHours(24)) {
                return $this->errorResponse('Impossible d\'annuler moins de 24h avant l\'événement', 422);
            }

            $event->available_places += $operation->quantity;
            $event->save();

            $operation->delete();

            DB::commit();

            return $this->successResponse([
                'restored_places' => $operation->quantity
            ], 'Réservation annulée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Erreur lors de l\'annulation', 500);
        }
    }

    /**
     * Récupérer les événements de l'utilisateur connecté
     */
    public function myEvents()
    {
        $user = JWTAuth::user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        try {
            $userOperations = Operation::where('user_id', $user->id)->get();
            $eventIds = $userOperations->pluck('event_id')->unique();

            // ✅ Charger les relations
            $events = Event::with(['localisation', 'categorie'])
                ->whereIn('id', $eventIds)
                ->orderBy('start_date')
                ->get();

            $createdEvents = collect();
            $reservedEvents = collect();

            foreach ($events as $event) {
                $userOpsForEvent = $userOperations->where('event_id', $event->id);
                $isCreator = $userOpsForEvent->where('type_operation_id', 1)->isNotEmpty();
                $reservationOps = $userOpsForEvent->where('type_operation_id', 2);

                $eventResource = new EventResource($event);
                $eventData = $eventResource->toArray(request());

                if ($isCreator) {
                    $createdEvents->push(array_merge($eventData, [
                        'is_creator' => true,
                        'user_role' => 'creator'
                    ]));
                }

                foreach ($reservationOps as $reservationOp) {
                    $reservedEvents->push(array_merge($eventData, [
                        'is_creator' => false,
                        'is_reserved' => true,
                        'operation_id' => $reservationOp->id,
                        'user_role' => 'participant'
                    ]));
                }
            }

            return $this->successResponse([
                'events' => $createdEvents->merge($reservedEvents)->values(),
                'created_events' => $createdEvents->values(),
                'reserved_events' => $reservedEvents->values(),
                'total' => $createdEvents->count() + $reservedEvents->count(),
                'total_created' => $createdEvents->count(),
                'total_reserved' => $reservedEvents->count(),
            ], 'Événements de l\'utilisateur récupérés');

        } catch (\Exception $e) {
            return $this->errorResponse('Erreur lors de la récupération des événements', 500);
        }
    }
}
