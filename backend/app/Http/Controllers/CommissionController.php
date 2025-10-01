<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CommissionController extends Controller
{
    /**
     * Récupérer tous les utilisateurs professionnels avec leur taux de commission
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
                    'commission_rate' => $user->commission_rate ?? 0,
                    'has_stripe' => !empty($user->stripeAccount_id),
                    'has_paypal' => !empty($user->paypalAccount_id),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $professionals,
                'total' => $professionals->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération professionnels: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des professionnels'
            ], 500);
        }
    }

    /**
     * Mettre à jour le taux de commission d'un utilisateur
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'commission_rate' => 'required|numeric|min:0|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($id);

            // Vérifier que c'est bien un professionnel
            if (!$user->roles()->where('role', 'professionnel')->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet utilisateur n\'est pas un professionnel'
                ], 400);
            }

            $oldRate = $user->commission_rate;
            $user->commission_rate = $request->commission_rate;
            $user->save();

            Log::info("Commission mise à jour pour {$user->email}: {$oldRate}% → {$user->commission_rate}%");

            return response()->json([
                'success' => true,
                'message' => 'Taux de commission mis à jour avec succès',
                'data' => [
                    'id' => $user->id,
                    'full_name' => $user->name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'commission_rate' => $user->commission_rate,
                    'old_rate' => $oldRate
                ]
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour commission: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Mettre à jour plusieurs taux de commission en une fois
     */
    public function bulkUpdate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'updates' => 'required|array|min:1',
                'updates.*.user_id' => 'required|exists:users,id',
                'updates.*.commission_rate' => 'required|numeric|min:0|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = [];
            $errors = [];

            foreach ($request->updates as $update) {
                try {
                    $user = User::findOrFail($update['user_id']);

                    if (!$user->roles()->where('role', 'professionnel')->exists()) {
                        $errors[] = [
                            'user_id' => $user->id,
                            'message' => 'Non professionnel'
                        ];
                        continue;
                    }

                    $user->commission_rate = $update['commission_rate'];
                    $user->save();

                    $updated[] = [
                        'user_id' => $user->id,
                        'full_name' => $user->name . ' ' . $user->last_name,
                        'new_rate' => $user->commission_rate
                    ];

                } catch (\Exception $e) {
                    $errors[] = [
                        'user_id' => $update['user_id'],
                        'message' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($updated) . ' taux mis à jour',
                'updated' => $updated,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur bulk update commission: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour groupée'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques sur les commissions
     */
    public function statistics()
    {
        try {
            $professionals = User::whereHas('roles', function ($query) {
                $query->where('role', 'professionnel');
            })->get();

            $stats = [
                'total_professionals' => $professionals->count(),
                'average_rate' => round($professionals->avg('commission_rate') ?? 0, 2),
                'min_rate' => $professionals->min('commission_rate') ?? 0,
                'max_rate' => $professionals->max('commission_rate') ?? 0,
                'with_stripe' => $professionals->where('stripeAccount_id', '!=', null)->count(),
                'with_paypal' => $professionals->where('paypalAccount_id', '!=', null)->count(),
                'rate_distribution' => [
                    '0-5%' => $professionals->whereBetween('commission_rate', [0, 5])->count(),
                    '5-10%' => $professionals->whereBetween('commission_rate', [5, 10])->count(),
                    '10-15%' => $professionals->whereBetween('commission_rate', [10, 15])->count(),
                    '15-20%' => $professionals->whereBetween('commission_rate', [15, 20])->count(),
                    '20%+' => $professionals->where('commission_rate', '>', 20)->count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur statistiques commission: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }
}
