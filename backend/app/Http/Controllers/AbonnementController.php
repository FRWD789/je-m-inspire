<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Abonnement;
use Carbon\Carbon;

class AbonnementController extends Controller
{
    public function index()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Récupération des abonnements', [
                    'user_id' => $user->id
                ]);
            }

            $abonnements = Abonnement::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($debug) {
                Log::info('Abonnements récupérés', [
                    'count' => $abonnements->count()
                ]);
            }

            return response()->json([
                'success' => true,
                'abonnements' => $abonnements
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des abonnements', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des abonnements'
            ], 500);
        }
    }

    public function current()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Récupération de l\'abonnement actuel', [
                    'user_id' => $user->id
                ]);
            }

            $abonnement = Abonnement::where('user_id', $user->id)
                ->where('statut', 'actif')
                ->where('date_fin', '>', Carbon::now())
                ->first();

            if ($abonnement) {
                if ($debug) {
                    Log::info('Abonnement actif trouvé', [
                        'abonnement_id' => $abonnement->id,
                        'type' => $abonnement->type,
                        'date_fin' => $abonnement->date_fin
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'abonnement' => $abonnement,
                    'has_active_subscription' => true
                ]);
            }

            if ($debug) {
                Log::info('Aucun abonnement actif', [
                    'user_id' => $user->id
                ]);
            }

            return response()->json([
                'success' => true,
                'abonnement' => null,
                'has_active_subscription' => false
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération de l\'abonnement actuel', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'abonnement'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Création d\'un abonnement', [
                    'user_id' => $user->id,
                    'data' => $request->all()
                ]);
            }

            $validatedData = $request->validate([
                'type' => 'required|in:mensuel,annuel',
                'montant' => 'required|numeric|min:0',
                'payment_intent_id' => 'sometimes|string'
            ]);

            // Calculer les dates
            $dateDebut = Carbon::now();
            $dateFin = $validatedData['type'] === 'mensuel'
                ? $dateDebut->copy()->addMonth()
                : $dateDebut->copy()->addYear();

            // Créer l'abonnement
            $abonnement = Abonnement::create([
                'user_id' => $user->id,
                'type' => $validatedData['type'],
                'montant' => $validatedData['montant'],
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'actif',
                'payment_intent_id' => $validatedData['payment_intent_id'] ?? null
            ]);

            // Mettre à jour le type d'utilisateur
            $user->user_type = 'professionnel';
            $user->save();

            if ($debug) {
                Log::info('Abonnement créé avec succès', [
                    'abonnement_id' => $abonnement->id,
                    'user_id' => $user->id,
                    'type' => $abonnement->type,
                    'date_fin' => $abonnement->date_fin
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Abonnement créé avec succès',
                'abonnement' => $abonnement
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de l\'abonnement', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'abonnement'
            ], 500);
        }
    }

    public function cancel($id)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();
            $abonnement = Abonnement::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            if ($debug) {
                Log::info('Annulation de l\'abonnement', [
                    'abonnement_id' => $id,
                    'user_id' => $user->id
                ]);
            }

            $abonnement->statut = 'annule';
            $abonnement->save();

            if ($debug) {
                Log::info('Abonnement annulé', [
                    'abonnement_id' => $id
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Abonnement annulé avec succès',
                'abonnement' => $abonnement
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'annulation de l\'abonnement', [
                'abonnement_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de l\'abonnement'
            ], 500);
        }
    }

    public function renew($id)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();
            $oldAbonnement = Abonnement::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            if ($debug) {
                Log::info('Renouvellement de l\'abonnement', [
                    'old_abonnement_id' => $id,
                    'user_id' => $user->id
                ]);
            }

            // Calculer les nouvelles dates
            $dateDebut = Carbon::now();
            $dateFin = $oldAbonnement->type === 'mensuel'
                ? $dateDebut->copy()->addMonth()
                : $dateDebut->copy()->addYear();

            // Créer un nouvel abonnement
            $newAbonnement = Abonnement::create([
                'user_id' => $user->id,
                'type' => $oldAbonnement->type,
                'montant' => $oldAbonnement->montant,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'actif'
            ]);

            // Marquer l'ancien comme expiré
            $oldAbonnement->statut = 'expire';
            $oldAbonnement->save();

            if ($debug) {
                Log::info('Abonnement renouvelé', [
                    'old_abonnement_id' => $id,
                    'new_abonnement_id' => $newAbonnement->id
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Abonnement renouvelé avec succès',
                'abonnement' => $newAbonnement
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du renouvellement de l\'abonnement', [
                'abonnement_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du renouvellement de l\'abonnement'
            ], 500);
        }
    }

    public function checkExpired()
    {
        $debug = config('app.debug');

        try {
            if ($debug) {
                Log::info('Vérification des abonnements expirés');
            }

            $expiredAbonnements = Abonnement::where('statut', 'actif')
                ->where('date_fin', '<', Carbon::now())
                ->get();

            foreach ($expiredAbonnements as $abonnement) {
                $abonnement->statut = 'expire';
                $abonnement->save();

                if ($debug) {
                    Log::info('Abonnement expiré', [
                        'abonnement_id' => $abonnement->id,
                        'user_id' => $abonnement->user_id
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($expiredAbonnements) . ' abonnement(s) expiré(s)',
                'count' => count($expiredAbonnements)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la vérification des abonnements expirés', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification'
            ], 500);
        }
    }
}
