<?php

namespace App\Observers;

use App\Models\Paiement;
use App\Services\CommissionService;
use Illuminate\Support\Facades\Log;

class PaiementObserver
{
    /**
     * Handle the Paiement "updated" event.
     *
     * Créer automatiquement une commission quand le statut passe à 'paid'
     */
    public function updated(Paiement $paiement)
    {
        $debug = config('app.debug');

        // Vérifier si le statut vient de passer à 'paid'
        if ($paiement->isDirty('status') && $paiement->status === 'paid') {

            if ($debug) {
                Log::info('[PaiementObserver] Statut passé à paid', [
                    'paiement_id' => $paiement->paiement_id,
                    'vendor_id' => $paiement->vendor_id
                ]);
            }

            // Vérifier qu'une commission n'existe pas déjà pour ce paiement
            if ($paiement->commission) {
                if ($debug) {
                    Log::info('[PaiementObserver] Commission déjà existante', [
                        'paiement_id' => $paiement->paiement_id,
                        'commission_id' => $paiement->commission->id
                    ]);
                }
                return;
            }

            // Créer la commission automatiquement
            Log::info('[PaiementObserver] Création automatique de commission', [
                'paiement_id' => $paiement->paiement_id
            ]);

            $commission = CommissionService::createCommissionForPaiement($paiement);

            if ($commission) {
                Log::info('[PaiementObserver] Commission créée avec succès', [
                    'paiement_id' => $paiement->paiement_id,
                    'commission_id' => $commission->id,
                    'type' => $commission->type,
                    'status' => $commission->status
                ]);
            } else {
                Log::warning('[PaiementObserver] Échec de création de commission', [
                    'paiement_id' => $paiement->paiement_id
                ]);
            }
        }
    }

    /**
     * Handle the Paiement "created" event.
     *
     * Alternative : Créer la commission dès la création du paiement
     * si le statut est déjà 'paid'
     *
     * NOTE : Cette méthode est optionnelle. Décommenter si vous voulez
     * créer les commissions dès la création des paiements qui sont
     * déjà marqués comme 'paid' à la création.
     */
    // public function created(Paiement $paiement)
    // {
    //     if ($paiement->status === 'paid' && $paiement->vendor_id) {
    //         Log::info('[PaiementObserver] Paiement créé avec status paid', [
    //             'paiement_id' => $paiement->paiement_id
    //         ]);

    //         CommissionService::createCommissionForPaiement($paiement);
    //     }
    // }
}
