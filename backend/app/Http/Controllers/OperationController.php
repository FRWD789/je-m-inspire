<?php

namespace App\Http\Controllers;

use App\Models\Event as ModelsEvent;
use App\Models\Operation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Contracts\Providers\JWT;
use Tymon\JWTAuth\Facades\JWTAuth;

class OperationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
public function store(Request $request)
{
    $user = JWTAuth::user();
    if (!$user) {
        return response()->json(['error' => 'Non authentifié'], 401);
    }

    // Validation de base
    $validated = $request->validate([
        'event_id' => 'required|exists:events,id',
        'type_operation_id' => 'required|in:1,2,3',
        'adults' => 'required|integer|min:0',
        'children' => 'required|integer|min:0',
    ]);

    $totalPlaces = $validated['adults'] + $validated['children'];


    $event = ModelsEvent::findOrFail($validated['event_id']);

    try {
        DB::beginTransaction();

        // 🔹 Cas 2 : Réservation
        if ($validated['type_operation_id'] == 2) {
            if ($event->available_places < $totalPlaces) {
                return response()->json(['error' => 'Pas assez de places disponibles'], 400);
            }

            $event->available_places -= $totalPlaces;
            $event->save();
        }

        // 🔹 Cas 3 : Transaction
        if ($validated['type_operation_id'] == 3) {
            // Ici tu peux gérer la logique de paiement
            // Exemple : vérifier prix, statut, etc.
        }

        // 🔹 Création de l'opération
        $operation = Operation::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'type_operation_id' => $validated['type_operation_id'],
            'adults' => $validated['adults'],
            'children' => $validated['children']
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
                'type'
            ])
            ->where('user_id', $user->id)
            ->where('type_operation_id', 2) // Réservations seulement
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'reservations' => $reservations,
            'total' => $reservations->count()
        ]);
    }
    /**
     * Display the specified resource.
     */
    public function show(Operation $operation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Operation $operation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Operation $operation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = JWTAuth::user();

        $operation = Operation::where('id', $id)
            ->where('user_id', $user->id) // sécuriser pour éviter de supprimer celle d’un autre
            ->first();

        if (!$operation) {
            return response()->json(['error' => 'Réservation introuvable'], 404);
        }

        $operation->delete();

        return response()->json(['message' => 'Réservation annulée avec succès']);
    }

}
