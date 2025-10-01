<?php

namespace App\Http\Controllers;

use App\Models\Remboursement;
use App\Models\Operation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RemboursementController extends Controller
{
    // Créer une demande de remboursement (Utilisateur)
public function store(Request $request)
{
    $request->validate([
        'operation_id' => 'required|exists:operations,id',
        'motif' => 'required|string|min:10',
        'montant' => 'required|numeric|min:0.01' // Validez aussi le montant reçu
    ]);

    $user = Auth::user();

    // Charger l'opération avec sa relation paiement
    $operation = Operation::with('paiement')
        ->where('id', $request->operation_id)
        ->where('user_id', $user->id)
        ->firstOrFail();

    // Vérifier que l'opération a un paiement et qu'il est payé
    if (!$operation->paiement) {
        return response()->json([
            'error' => 'Cette réservation n\'a pas de paiement associé'
        ], 400);
    }

    if ($operation->paiement->status !== 'paid') {
        return response()->json([
            'error' => 'Seules les réservations payées peuvent être remboursées'
        ], 400);
    }

    // Vérifier qu'il n'y a pas déjà une demande en attente
    $demandeExistante = Remboursement::where('operation_id', $operation->id)
        ->where('statut', 'en_attente')
        ->first();

    if ($demandeExistante) {
        return response()->json([
            'error' => 'Une demande de remboursement est déjà en cours pour cette réservation'
        ], 400);
    }

    // Vérifier que le montant envoyé correspond au montant du paiement
    $montantPaiement = floatval($operation->paiement->total);
    $montantDemande = floatval($request->montant);

    if (abs($montantPaiement - $montantDemande) > 0.01) {
        return response()->json([
            'error' => 'Le montant demandé ne correspond pas au montant payé'
        ], 400);
    }

    // Créer la demande de remboursement
    $remboursement = Remboursement::create([
        'user_id' => $user->id,
        'operation_id' => $operation->id,
        'montant' => $montantPaiement, // Utiliser le montant du paiement
        'motif' => $request->motif,
        'statut' => 'en_attente'
    ]);

    return response()->json([
        'message' => 'Demande de remboursement créée avec succès',
        'remboursement' => $remboursement->load('operation.event')
    ], 201);
}

    // Voir mes demandes de remboursement (Utilisateur)
    public function mesDemandes()
    {
        $demandes = Remboursement::where('user_id', Auth::id())
            ->with('operation.event') // ← Changez 'evenement' en 'event'
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($demandes); // Cette ligne est OK pour renvoyer directement le tableau
    }

    // Voir toutes les demandes (Admin)
// Voir toutes les demandes (Admin)
public function index()
{
    try {
        \Log::info('Tentative de récupération des remboursements');

        $demandes = Remboursement::with(['user', 'operation.event'])
            ->orderBy('created_at', 'desc')
            ->get();

        \Log::info('Remboursements récupérés:', ['count' => $demandes->count()]);

        return response()->json($demandes);
    } catch (\Exception $e) {
        \Log::error('Erreur lors de la récupération des remboursements:', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'error' => 'Erreur serveur',
            'message' => $e->getMessage()
        ], 500);
    }
}

    // Traiter une demande (Admin)
    public function traiter(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:approuve,refuse',
            'commentaire_admin' => 'nullable|string'
        ]);

        $remboursement = Remboursement::findOrFail($id);

        $remboursement->update([
            'statut' => $request->statut,
            'commentaire_admin' => $request->commentaire_admin,
            'date_traitement' => now()
        ]);

        return response()->json([
            'message' => 'Demande traitée avec succès',
            'remboursement' => $remboursement->load(['user', 'operation.event'])
        ]);
    }
}
