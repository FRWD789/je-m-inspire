<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Operation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Tous les utilisateurs voient tous les événements
        return response()->json(Event::with(['localisation', 'categorie'])->get());
    }

    //Voici la modification de votre méthode store pour créer automatiquement l'opération lors de la création d'un événement :
//phppublic
    function store(Request $request)
    {
        // Vérifier l'authentification
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
            'description' => 'required|string',
            'start_date' => 'required|date|after_or_equal:now',
            'end_date' => 'required|date|after:start_date',
            'base_price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'max_places' => 'required|integer|min:1',
            'level' => 'required|string|max:50',
            'priority' => 'required|integer|min:1|max:10',
            'localisation_id' => 'required|exists:localisations,id',
            'categorie_event_id' => 'required|exists:categorie_events,id',
        ]);

        $validated['available_places'] = $validated['max_places'];

        try {
            DB::beginTransaction();

            // Créer l'événement
            $event = Event::create($validated);

            // Créer l'opération associée avec le type "Creation Evenement" (ID 1)
            Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 1 // Type "Creation Evenement"
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Événement créé avec succès',
                'event' => $event
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de la création de l\'événement',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function myEvents()
    {
        $user = JWTAuth::user();

        // Filtrer les événements créés par l'utilisateur via les opérations
        $events = Event::with(['localisation', 'categorie'])
            ->whereHas('operation', function($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('type_operation_id', 1); // Type "Creation Evenement"
            })
            ->get();

        return response()->json([
            'events' => $events
        ]);
    }
    public function update(Request $request, $id)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        // Vérifier que l'utilisateur est le créateur de l'événement
        $isOwner = $event->operation()
            ->where('user_id', $user->id)
            ->where('type_operation_id', 1) // Type "Creation Evenement"
            ->exists();

        // Les admins peuvent modifier tous les événements
        if (!$isOwner && !$user->hasRole('admin')) {
            return response()->json([
                'error' => 'Vous ne pouvez modifier que vos propres événements'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name'             => 'sometimes|required|string|max:255',
            'description'      => 'sometimes|required|string',
            'start_date'       => 'sometimes|required|date',
            'end_date'         => 'sometimes|required|date|after_or_equal:start_date',
            'base_price'       => 'sometimes|required|numeric|min:0',
            'capacity'         => 'sometimes|required|integer|min:1',
            'max_places'       => 'sometimes|required|integer|min:1',
            'level'            => 'sometimes|required|string|max:50',
            'priority'         => 'sometimes|required|integer|min:1|max:10',
            'localisation_id'  => 'sometimes|required|exists:localisations,id',
            'categorie_event_id' => 'sometimes|required|exists:categorie_events,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
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

        $event->update($validated);

        return response()->json([
            'message' => 'Événement modifié avec succès',
            'event' => $event->load(['localisation', 'categorie'])
        ]);
    }
    /**
     * Afficher un seul evenement selon son id
     */
   public function show($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        return new EventResource($event);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event)
    {
        //
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = JWTAuth::user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        // Vérifier que l'utilisateur est le créateur de l'événement
        $isOwner = $event->operation()
            ->where('user_id', $user->id)
            ->where('type_operation_id', 1) // Type "Creation Evenement"
            ->exists();

        // Les admins peuvent supprimer tous les événements
        if (!$isOwner && !$user->hasRole('admin')) {
            return response()->json([
                'error' => 'Vous ne pouvez supprimer que vos propres événements'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Supprimer l'opération associée (si elle existe)
            $event->operation()->delete();

            // Supprimer l'événement
            $event->delete();

            DB::commit();

            return response()->json([
                'message' => 'Événement supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Erreur lors de la suppression',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    }
