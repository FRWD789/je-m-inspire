<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Commission;
use App\Models\Operation;

class CommissionController extends Controller
{
    public function index()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Récupération des commissions', [
                    'user_id' => $user->id,
                    'is_admin' => $user->is_admin
                ]);
            }

            // Si admin, récupérer toutes les commissions
            if ($user->is_admin) {
                $commissions = Commission::with(['operation', 'vendor'])
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                // Sinon, récupérer uniquement les commissions du vendeur
                $commissions = Commission::with(['operation'])
                    ->where('vendor_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            if ($debug) {
                Log::info('Commissions récupérées', [
                    'count' => $commissions->count()
                ]);
            }

            return response()->json([
                'success' => true,
                'commissions' => $commissions
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des commissions', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commissions'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $debug = config('app.debug');

        try {
            if ($debug) {
                Log::info('Création d\'une commission', [
                    'data' => $request->all()
                ]);
            }

            $validatedData = $request->validate([
                'operation_id' => 'required|exists:operations,id',
                'vendor_id' => 'required|exists:users,id',
                'montant' => 'required|numeric|min:0',
                'pourcentage' => 'required|numeric|min:0|max:100',
                'statut' => 'sometimes|in:en_attente,payee,annulee'
            ]);

            $commission = Commission::create($validatedData);

            if ($debug) {
                Log::info('Commission créée', [
                    'commission_id' => $commission->id,
                    'montant' => $commission->montant
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Commission créée avec succès',
                'commission' => $commission->load(['operation', 'vendor'])
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de la commission', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la commission'
            ], 500);
        }
    }

    public function show($id)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();
            $commission = Commission::with(['operation', 'vendor'])->findOrFail($id);

            // Vérifier les permissions
            if (!$user->is_admin && $commission->vendor_id !== $user->id) {
                if ($debug) {
                    Log::info('Accès refusé à la commission', [
                        'user_id' => $user->id,
                        'commission_id' => $id
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if ($debug) {
                Log::info('Commission récupérée', [
                    'commission_id' => $id
                ]);
            }

            return response()->json([
                'success' => true,
                'commission' => $commission
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération de la commission', [
                'commission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Commission non trouvée'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Action réservée aux administrateurs'
                ], 403);
            }

            $commission = Commission::findOrFail($id);

            if ($debug) {
                Log::info('Mise à jour de la commission', [
                    'commission_id' => $id,
                    'data' => $request->all()
                ]);
            }

            $validatedData = $request->validate([
                'montant' => 'sometimes|numeric|min:0',
                'pourcentage' => 'sometimes|numeric|min:0|max:100',
                'statut' => 'sometimes|in:en_attente,payee,annulee'
            ]);

            $commission->update($validatedData);

            if ($debug) {
                Log::info('Commission mise à jour', [
                    'commission_id' => $id
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Commission mise à jour avec succès',
                'commission' => $commission->load(['operation', 'vendor'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la commission', [
                'commission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la commission'
            ], 500);
        }
    }

    public function markAsPaid($id)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Action réservée aux administrateurs'
                ], 403);
            }

            $commission = Commission::findOrFail($id);
            $commission->statut = 'payee';
            $commission->save();

            if ($debug) {
                Log::info('Commission marquée comme payée', [
                    'commission_id' => $id,
                    'montant' => $commission->montant
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Commission marquée comme payée',
                'commission' => $commission->load(['operation', 'vendor'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du marquage de la commission comme payée', [
                'commission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du marquage de la commission'
            ], 500);
        }
    }

    public function getStats()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if ($debug) {
                Log::info('Récupération des statistiques des commissions', [
                    'user_id' => $user->id
                ]);
            }

            $query = Commission::query();

            if (!$user->is_admin) {
                $query->where('vendor_id', $user->id);
            }

            $stats = [
                'total' => $query->sum('montant'),
                'en_attente' => $query->where('statut', 'en_attente')->sum('montant'),
                'payees' => $query->where('statut', 'payee')->sum('montant'),
                'count_total' => $query->count(),
                'count_en_attente' => $query->where('statut', 'en_attente')->count(),
                'count_payees' => $query->where('statut', 'payee')->count()
            ];

            if ($debug) {
                Log::info('Statistiques calculées', $stats);
            }

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du calcul des statistiques', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques'
            ], 500);
        }
    }
}
