<?php

namespace App\Http\Controllers;

use App\Http\Resources\AbonnementResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\Abonnement;
use App\Models\Operation;
use App\Models\User;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AbonnementController extends Controller
{
    use ApiResponse;

    /**
     * Créer une session de paiement Stripe pour Pro Plus
     */
    public function abonnementStripe(Request $request)
    {
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $user = Auth::user();

            // ✅ LOGIQUE INCHANGÉE
            if ($user->hasProPlus()) {
                // ✅ SEULEMENT LE RETURN EST MODIFIÉ
                return $this->errorResponse('Vous avez déjà un abonnement Pro Plus actif', 400);
            }

            // ✅ LOGIQUE INCHANGÉE
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => config('services.stripe.pro_plus_price_id'),
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => env('FRONTEND_URL') . '/abonnement/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => env('FRONTEND_URL') . '/abonnement/cancel',
                'client_reference_id' => $user->id,
                'customer_email' => $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_type' => 'pro-plus'
                ]
            ]);

            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->successResponse([
                'session_id' => $session->id,
                'url' => $session->url
            ], 'Session d\'abonnement créée avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur abonnement Stripe: ' . $e->getMessage());
            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->errorResponse('Erreur lors de la création de la session', 500);
        }
    }

    /**
     * Créer un abonnement PayPal Pro Plus
     */
    public function abonnementPaypal(Request $request)
    {
        try {
            $user = Auth::user();

            // ✅ LOGIQUE INCHANGÉE - Vérifier si l'utilisateur a déjà un abonnement
            if ($user->hasProPlus()) {
                return $this->errorResponse('Vous avez déjà un abonnement Pro Plus actif', 400);
            }

            // ✅ LOGIQUE INCHANGÉE - Récupérer les credentials PayPal
            $clientId = config('services.paypal.client_id');
            $secret = config('services.paypal.secret');
            $mode = config('services.paypal.mode', 'sandbox');
            $planId = config('services.paypal.pro_plus_plan_id');

            Log::info('[PayPal] Configuration chargée', [
                'mode' => $mode,
                'client_id' => $clientId ? 'OK' : 'MANQUANT',
                'secret' => $secret ? 'OK' : 'MANQUANT',
                'plan_id' => $planId ?? 'MANQUANT'
            ]);

            // ✅ LOGIQUE INCHANGÉE - Vérifier que les credentials existent
            if (!$clientId || !$secret) {
                Log::error('[PayPal] Credentials manquants dans .env');
                return $this->errorResponse('Configuration PayPal incomplète. Vérifiez vos credentials.', 500);
            }

            if (!$planId) {
                Log::error('[PayPal] Plan ID manquant dans .env');
                return $this->errorResponse('Plan PayPal non configuré.', 500);
            }

            // ✅ LOGIQUE INCHANGÉE
            $baseUrl = $mode === 'live'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            // ✅ LOGIQUE INCHANGÉE - Obtenir le token d'accès
            Log::info('[PayPal] Demande token à: ' . $baseUrl);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "$baseUrl/v1/oauth2/token");
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERPWD, $clientId . ":" . $secret);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");

            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            // ✅ LOGIQUE INCHANGÉE - Vérifier erreur cURL
            if ($curlError) {
                Log::error('[PayPal] Erreur cURL lors de l\'authentification', [
                    'error' => $curlError
                ]);
                return $this->errorResponse('Erreur de connexion à PayPal: ' . $curlError, 500);
            }

            // ✅ LOGIQUE INCHANGÉE - Vérifier code HTTP
            if ($httpCode !== 200) {
                Log::error('[PayPal] Erreur HTTP authentification', [
                    'http_code' => $httpCode,
                    'response' => $result
                ]);
                return $this->errorResponse('Échec authentification PayPal (HTTP ' . $httpCode . ')', 500);
            }

            // ✅ LOGIQUE INCHANGÉE
            $tokenData = json_decode($result);

            if (!isset($tokenData->access_token)) {
                Log::error('[PayPal] Token non reçu', ['response' => $tokenData]);
                return $this->errorResponse('Token PayPal non reçu', 500);
            }

            $token = $tokenData->access_token;
            Log::info('[PayPal] Token obtenu avec succès');

            // ✅ LOGIQUE INCHANGÉE - Créer l'abonnement
            $subscriptionData = [
                "plan_id" => $planId,
                "application_context" => [
                    "brand_name" => "Je m'inspire",
                    "locale" => "fr-CA",
                    "shipping_preference" => "NO_SHIPPING",
                    "user_action" => "SUBSCRIBE_NOW",
                    "return_url" => env('FRONTEND_URL') . '/abonnement/success',
                    "cancel_url" => env('FRONTEND_URL') . '/abonnement/cancel'
                ]
            ];

            Log::info('[PayPal] Création abonnement', ['plan_id' => $planId]);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "$baseUrl/v1/billing/subscriptions");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer $token",
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($subscriptionData));

            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            // ✅ LOGIQUE INCHANGÉE - Vérifier erreurs
            if ($curlError) {
                Log::error('[PayPal] Erreur cURL création abonnement', [
                    'error' => $curlError
                ]);
                return $this->errorResponse('Erreur lors de la création: ' . $curlError, 500);
            }

            $subscription = json_decode($result);

            if ($httpCode !== 201) {
                Log::error('[PayPal] Erreur création abonnement', [
                    'http_code' => $httpCode,
                    'response' => $subscription
                ]);
                return $this->errorResponse('Échec création abonnement (HTTP ' . $httpCode . ')', 500);
            }

            if (!isset($subscription->id)) {
                Log::error('[PayPal] ID abonnement manquant', [
                    'response' => $subscription
                ]);
                return $this->errorResponse('ID abonnement non reçu', 500);
            }

            // ✅ LOGIQUE INCHANGÉE - Récupérer l'URL d'approbation
            $approvalUrl = collect($subscription->links)
                ->firstWhere('rel', 'approve')
                ->href ?? null;

            Log::info('[PayPal] ✅ Abonnement créé avec succès', [
                'subscription_id' => $subscription->id,
                'approval_url' => $approvalUrl ? 'OK' : 'MANQUANT'
            ]);

            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->successResponse([
                'subscription_id' => $subscription->id,
                'approval_url' => $approvalUrl
            ], 'Abonnement PayPal créé avec succès');

        } catch (\Exception $e) {
            Log::error('[PayPal] Erreur finale: ' . $e->getMessage());
            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Webhook PayPal pour gérer les événements d'abonnement
     */
    public function abonnementPaypalWebhook(Request $request)
    {
        $payload = $request->all();
        $eventType = $payload['event_type'] ?? null;

        Log::info('[PayPal Webhook] Événement reçu', [
            'type' => $eventType,
            'resource_id' => $payload['resource']['id'] ?? 'N/A'
        ]);

        try {
            // ✅ LOGIQUE INCHANGÉE
            switch ($eventType) {
                case 'BILLING.SUBSCRIPTION.ACTIVATED':
                    $this->handlePaypalSubscriptionActivated($payload);
                    break;

                case 'BILLING.SUBSCRIPTION.CANCELLED':
                    $this->handlePaypalSubscriptionCancelled($payload);
                    break;

                case 'BILLING.SUBSCRIPTION.SUSPENDED':
                    $this->handlePaypalSubscriptionSuspended($payload);
                    break;

                case 'PAYMENT.SALE.COMPLETED':
                    $this->handlePaypalPaymentCompleted($payload);
                    break;

                default:
                    Log::info('[PayPal Webhook] Type non géré: ' . $eventType);
            }

            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->successResponse(null, 'Webhook traité avec succès');

        } catch (\Exception $e) {
            Log::error('[PayPal Webhook] Erreur: ' . $e->getMessage());
            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->errorResponse('Erreur lors du traitement du webhook', 400);
        }
    }

    /**
     * ✅ LOGIQUE INCHANGÉE - Gérer l'activation d'un abonnement
     */
    private function handlePaypalSubscriptionActivated($payload)
    {
        $subscriptionId = $payload['resource']['id'];
        Log::info("Abonnement PayPal activé: $subscriptionId");
    }

    /**
     * ✅ LOGIQUE INCHANGÉE - Gérer l'annulation d'un abonnement
     */
    private function handlePaypalSubscriptionCancelled($payload)
    {
        $subscriptionId = $payload['resource']['id'];
        Log::info("Abonnement PayPal annulé: $subscriptionId");
    }

    /**
     * ✅ LOGIQUE INCHANGÉE - Gérer la suspension d'un abonnement
     */
    private function handlePaypalSubscriptionSuspended($payload)
    {
        $subscriptionId = $payload['resource']['id'];
        Log::info("Abonnement PayPal suspendu: $subscriptionId");
    }

    /**
     * ✅ LOGIQUE INCHANGÉE - Gérer la complétion d'un paiement
     */
    private function handlePaypalPaymentCompleted($payload)
    {
        Log::info("Paiement PayPal complété: {$payload['resource']['id']}");
    }

    /**
     * Annuler l'abonnement Pro Plus de l'utilisateur
     */
    public function cancelAbonnement(Request $request)
    {
        try {
            $user = Auth::user();

            // ✅ LOGIQUE INCHANGÉE
            $abonnement = $user->abonnementActif()->first();

            if (!$abonnement) {
                // ✅ SEULEMENT LE RETURN EST MODIFIÉ
                return $this->notFoundResponse('Aucun abonnement actif trouvé');
            }

            // ✅ LOGIQUE INCHANGÉE - Annuler sur Stripe
            if ($abonnement->stripe_subscription_id) {
                Stripe::setApiKey(config('services.stripe.secret'));
                \Stripe\Subscription::update(
                    $abonnement->stripe_subscription_id,
                    ['cancel_at_period_end' => true]
                );
            }

            // ✅ LOGIQUE INCHANGÉE - Annuler sur PayPal
            if ($abonnement->paypal_subscription_id) {
                Log::info("Demande d'annulation PayPal: {$abonnement->paypal_subscription_id}");
            }

            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->successResponse(
                null,
                'Votre abonnement sera annulé à la fin de la période en cours'
            );

        } catch (\Exception $e) {
            Log::error('Erreur cancelAbonnement: ' . $e->getMessage());
            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->errorResponse('Erreur lors de l\'annulation de l\'abonnement', 500);
        }
    }

    /**
     * Obtenir les informations d'abonnement de l'utilisateur
     */
    public function getAbonnementInfo()
    {
        try {
            $user = Auth::user();

            // ✅ LOGIQUE INCHANGÉE
            $abonnement = $user->abonnementActif()->first();

            if (!$abonnement) {
                // ✅ SEULEMENT LE RETURN EST MODIFIÉ
                return $this->successResponse([
                    'has_subscription' => false,
                    'subscription' => null
                ], 'Aucun abonnement actif');
            }

            // ✅ SEULEMENT LE RETURN EST MODIFIÉ (maintenant avec Resource)
            return $this->successResponse([
                'has_subscription' => true,
                'subscription' => new AbonnementResource($abonnement)
            ], 'Informations d\'abonnement récupérées');

        } catch (\Exception $e) {
            Log::error('Erreur getAbonnementInfo: ' . $e->getMessage());
            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->errorResponse('Erreur lors de la récupération des informations', 500);
        }
    }

    /**
     * Vérifier le statut d'abonnement de l'utilisateur
     */
    public function checkSubscriptionStatus()
    {
        try {
            $user = Auth::user();

            // ✅ LOGIQUE INCHANGÉE
            $hasProPlus = $user->hasProPlus();

            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->successResponse([
                'has_pro_plus' => $hasProPlus,
                'user_id' => $user->id
            ], 'Statut d\'abonnement vérifié');

        } catch (\Exception $e) {
            Log::error('Erreur checkSubscriptionStatus: ' . $e->getMessage());
            // ✅ SEULEMENT LE RETURN EST MODIFIÉ
            return $this->errorResponse('Erreur lors de la vérification du statut', 500);
        }
    }
}
