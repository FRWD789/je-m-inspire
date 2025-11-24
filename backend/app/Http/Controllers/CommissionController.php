<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Commission;
use App\Models\User;
use App\Traits\ApiResponse;

class CommissionController extends Controller
{
    use ApiResponse;

    /**
     * Récupérer les commissions indirectes en attente
     * (Onglet "Paiements à transférer")
     */
    public function getPendingTransfers()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->roles()->where('role', 'admin')->exists()) {
                return $this->unauthorizedResponse('Accès réservé aux administrateurs');
            }

            if ($debug) {
                Log::info('[Commission] Récupération des paiements à transférer');
            }

            // Récupérer les commissions indirectes et en attente
            $commissions = Commission::with(['paiement.operation.event', 'paiement.operation.user', 'vendor'])
                ->indirect()
                ->pending()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($commission) {
                    return [
                        'id' => $commission->id,
                        'paiement_id' => $commission->paiement_id,
                        'date' => $commission->created_at->format('Y-m-d H:i'),
                        'event_name' => $commission->paiement->operation->event->name ?? 'N/A',
                        'event_id' => $commission->paiement->operation->event_id ?? null,
                        'customer_name' => $commission->paiement->operation->user->name ?? 'N/A',
                        'vendor_id' => $commission->vendor_id,
                        'vendor_name' => $commission->vendor->name . ' ' . $commission->vendor->last_name,
                        'montant_total' => $commission->montant_total,
                        'taux_commission' => $commission->taux_commission,
                        'montant_commission' => $commission->montant_commission,
                        'montant_net' => $commission->montant_net,
                        'payment_method' => $commission->paiement->session_id ? 'Stripe' :
                                          ($commission->paiement->paypal_id ? 'PayPal' : 'Autre'),
                        'vendor_has_stripe' => !empty($commission->vendor->stripeAccount_id),
                        'vendor_has_paypal' => !empty($commission->vendor->paypalAccount_id),
                        'vendor_stripe_id' => $commission->vendor->stripeAccount_id,
                        'vendor_paypal_id' => $commission->vendor->paypalAccount_id,
                        'vendor_paypal_email' => $commission->vendor->paypalEmail,
                    ];
                });

            // Calculer les stats
            $stats = [
                'total_a_transferer' => $commissions->sum('montant_net'),
                'nombre_paiements' => $commissions->count(),
                'total_commissions' => $commissions->sum('montant_commission'),
            ];

            if ($debug) {
                Log::info('[Commission] Paiements à transférer', [
                    'count' => $commissions->count(),
                    'total' => $stats['total_a_transferer']
                ]);
            }

            return $this->successResponse([
                'commissions' => $commissions,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('[Commission] Erreur getPendingTransfers', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Erreur lors de la récupération des paiements', 500);
        }
    }

    /**
     * Marquer une commission comme payée
     */
    public function markAsPaid(Request $request, $id)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->roles()->where('role', 'admin')->exists()) {
                return $this->unauthorizedResponse('Accès réservé aux administrateurs');
            }

            $commission = Commission::findOrFail($id);

            // Vérifier que c'est bien une commission indirecte
            if ($commission->type !== 'indirect') {
                return $this->errorResponse('Cette commission n\'est pas de type indirect', 400);
            }

            $notes = $request->input('notes');
            $commission->markAsPaid($notes);

            if ($debug) {
                Log::info('[Commission] Commission marquée comme payée', [
                    'commission_id' => $id,
                    'montant_net' => $commission->montant_net,
                    'vendor_id' => $commission->vendor_id
                ]);
            }

            return $this->successResponse([
                'commission' => $commission->load(['paiement', 'vendor'])
            ], 'Commission marquée comme payée');

        } catch (\Exception $e) {
            Log::error('[Commission] Erreur markAsPaid', [
                'commission_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Erreur lors du marquage de la commission', 500);
        }
    }

    /**
     * Récupérer tous les professionnels avec leur taux de commission
     * (Onglet "Taux de commission")
     */
    public function getProfessionals()
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->roles()->where('role', 'admin')->exists()) {
                return $this->unauthorizedResponse('Accès réservé aux administrateurs');
            }

            if ($debug) {
                Log::info('[Commission] Récupération des professionnels');
            }

            $professionals = User::whereHas('roles', function($query) {
                    $query->where('role', 'professionnel');
                })
                ->with('roles')
                ->orderBy('name')
                ->get()
                ->map(function($pro) {
                    return [
                        'id' => $pro->id,
                        'name' => $pro->name . ' ' . $pro->last_name,
                        'email' => $pro->email,
                        'commission_rate' => $pro->commission_rate,
                        'has_pro_plus' => $pro->hasProPlus(),
                        'has_stripe' => !empty($pro->stripeAccount_id),
                        'has_paypal' => !empty($pro->paypalAccount_id),
                        'is_approved' => $pro->is_approved,
                    ];
                });

            if ($debug) {
                Log::info('[Commission] Professionnels récupérés', [
                    'count' => $professionals->count()
                ]);
            }

            return $this->successResponse([
                'professionals' => $professionals
            ]);

        } catch (\Exception $e) {
            Log::error('[Commission] Erreur getProfessionals', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Erreur lors de la récupération des professionnels', 500);
        }
    }

    /**
     * Mettre à jour le taux de commission d'un professionnel
     */
    public function updateCommissionRate(Request $request, $userId)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->roles()->where('role', 'admin')->exists()) {
                return $this->unauthorizedResponse('Accès réservé aux administrateurs');
            }

            $validated = $request->validate([
                'commission_rate' => 'required|numeric|min:0|max:100'
            ]);

            $professional = User::findOrFail($userId);

            // Vérifier que c'est bien un professionnel
            if (!$professional->roles()->where('role', 'professionnel')->exists()) {
                return $this->errorResponse('Cet utilisateur n\'est pas un professionnel', 400);
            }

            $oldRate = $professional->commission_rate;
            $professional->commission_rate = $validated['commission_rate'];
            $professional->save();

            if ($debug) {
                Log::info('[Commission] Taux mis à jour', [
                    'user_id' => $userId,
                    'old_rate' => $oldRate,
                    'new_rate' => $validated['commission_rate']
                ]);
            }

            return $this->successResponse([
                'professional' => [
                    'id' => $professional->id,
                    'name' => $professional->name . ' ' . $professional->last_name,
                    'commission_rate' => $professional->commission_rate
                ]
            ], 'Taux de commission mis à jour');

        } catch (\Exception $e) {
            Log::error('[Commission] Erreur updateCommissionRate', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Erreur lors de la mise à jour du taux', 500);
        }
    }

    /**
     * Mettre à jour plusieurs taux de commission en masse
     */
    public function bulkUpdateRates(Request $request)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->roles()->where('role', 'admin')->exists()) {
                return $this->unauthorizedResponse('Accès réservé aux administrateurs');
            }

            $validated = $request->validate([
                'updates' => 'required|array',
                'updates.*.user_id' => 'required|exists:users,id',
                'updates.*.commission_rate' => 'required|numeric|min:0|max:100'
            ]);

            $updated = [];

            DB::beginTransaction();

            foreach ($validated['updates'] as $update) {
                $professional = User::findOrFail($update['user_id']);

                if ($professional->roles()->where('role', 'professionnel')->exists()) {
                    $professional->commission_rate = $update['commission_rate'];
                    $professional->save();

                    $updated[] = [
                        'id' => $professional->id,
                        'name' => $professional->name . ' ' . $professional->last_name,
                        'commission_rate' => $professional->commission_rate
                    ];
                }
            }

            DB::commit();

            if ($debug) {
                Log::info('[Commission] Mise à jour en masse', [
                    'count' => count($updated)
                ]);
            }

            return $this->successResponse([
                'updated' => $updated,
                'count' => count($updated)
            ], 'Taux de commission mis à jour');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Commission] Erreur bulkUpdateRates', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Erreur lors de la mise à jour en masse', 500);
        }
    }

    /**
     * Obtenir l'historique de toutes les commissions (pour analytics)
     */
    public function getAllCommissions(Request $request)
    {
        $debug = config('app.debug');

        try {
            $user = Auth::user();

            if (!$user->roles()->where('role', 'admin')->exists()) {
                return $this->unauthorizedResponse('Accès réservé aux administrateurs');
            }

            $type = $request->query('type'); // 'direct', 'indirect', ou null pour tous
            $status = $request->query('status'); // 'pending', 'paid', ou null pour tous

            $query = Commission::with(['paiement', 'vendor']);

            if ($type) {
                $query->where('type', $type);
            }

            if ($status) {
                $query->where('status', $status);
            }

            $commissions = $query->orderBy('created_at', 'desc')->get();

            if ($debug) {
                Log::info('[Commission] Historique récupéré', [
                    'count' => $commissions->count(),
                    'type' => $type,
                    'status' => $status
                ]);
            }

            return $this->successResponse([
                'commissions' => $commissions
            ]);

        } catch (\Exception $e) {
            Log::error('[Commission] Erreur getAllCommissions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Erreur lors de la récupération des commissions', 500);
        }
    }
}
