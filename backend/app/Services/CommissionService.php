<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Paiement;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Créer une commission pour un paiement
     *
     * @param Paiement $paiement
     * @return Commission|null
     */
    public static function createCommissionForPaiement(Paiement $paiement)
    {
        $debug = config('app.debug');

        try {
            // Vérifier que le paiement a un vendor_id
            if (!$paiement->vendor_id) {
                if ($debug) {
                    Log::info('[CommissionService] Pas de vendor_id pour le paiement', [
                        'paiement_id' => $paiement->paiement_id
                    ]);
                }
                return null;
            }

            // Récupérer le vendor
            $vendor = User::find($paiement->vendor_id);
            if (!$vendor) {
                Log::error('[CommissionService] Vendor introuvable', [
                    'vendor_id' => $paiement->vendor_id
                ]);
                return null;
            }

            // Calculer les montants
            $montantTotal = $paiement->total;
            $tauxCommission = $paiement->taux_commission ?? $vendor->commission_rate;
            $montantCommission = $montantTotal * ($tauxCommission / 100);
            $montantNet = $montantTotal - $montantCommission;

            // Déterminer le type de commission
            // Une commission est "directe" si le vendor a Pro Plus ET au moins un compte lié
            $hasProPlus = $vendor->hasProPlus();
            $hasLinkedAccount = !empty($vendor->stripeAccount_id) || !empty($vendor->paypalAccount_id);
            $isDirect = $hasProPlus && $hasLinkedAccount;

            $type = $isDirect ? 'direct' : 'indirect';

            // Si c'est direct, la commission est automatiquement "paid"
            // Si c'est indirect, elle reste "pending"
            $status = $isDirect ? 'paid' : 'pending';
            $paidAt = $isDirect ? now() : null;

            // Créer la commission
            $commission = Commission::create([
                'paiement_id' => $paiement->paiement_id,
                'vendor_id' => $vendor->id,
                'montant_total' => $montantTotal,
                'taux_commission' => $tauxCommission,
                'montant_commission' => $montantCommission,
                'montant_net' => $montantNet,
                'type' => $type,
                'status' => $status,
                'paid_at' => $paidAt,
            ]);

            if ($debug) {
                Log::info('[CommissionService] Commission créée', [
                    'commission_id' => $commission->id,
                    'paiement_id' => $paiement->paiement_id,
                    'vendor_id' => $vendor->id,
                    'montant_net' => $montantNet,
                    'type' => $type,
                    'status' => $status,
                ]);
            }

            return $commission;

        } catch (\Exception $e) {
            Log::error('[CommissionService] Erreur lors de la création de commission', [
                'paiement_id' => $paiement->paiement_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return null;
        }
    }

    /**
     * Recalculer une commission existante
     * (Utile si le taux de commission ou le montant change)
     *
     * @param Commission $commission
     * @return bool
     */
    public static function recalculateCommission(Commission $commission)
    {
        try {
            $paiement = $commission->paiement;
            $vendor = $commission->vendor;

            if (!$paiement || !$vendor) {
                return false;
            }

            $montantTotal = $paiement->total;
            $tauxCommission = $paiement->taux_commission ?? $vendor->commission_rate;
            $montantCommission = $montantTotal * ($tauxCommission / 100);
            $montantNet = $montantTotal - $montantCommission;

            $commission->update([
                'montant_total' => $montantTotal,
                'taux_commission' => $tauxCommission,
                'montant_commission' => $montantCommission,
                'montant_net' => $montantNet,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('[CommissionService] Erreur lors du recalcul de commission', [
                'commission_id' => $commission->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }
}
