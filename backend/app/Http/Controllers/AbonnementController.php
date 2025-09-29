<?php

namespace App\Http\Controllers;

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
    /**
     * Créer une session de paiement Stripe pour l'abonnement Pro Plus
     */
    public function abonnementStripe(Request $request)
    {
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $user = Auth::user();

            // Vérifier si l'utilisateur a déjà un abonnement Pro Plus actif
            if ($user->hasProPlus()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà un abonnement Pro Plus actif'
                ], 400);
            }

            // Créer une session de checkout Stripe pour Pro Plus
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => config('services.stripe.pro_plus_price_id'),
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => env('FRONTEND_URL') . '/abonnement/success' . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => env('FRONTEND_URL') . '/abonnement/cancel',
                'client_reference_id' => $user->id,
                'customer_email' => $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_type' => 'pro-plus'
                ]
            ]);

            return response()->json([
                'success' => true,
                'session_id' => $session->id,
                'url' => $session->url
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur Stripe: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la session de paiement'
            ], 500);
        }
    }

    /**
     * Créer un abonnement PayPal Pro Plus
     */
    public function abonnementPaypal(Request $request)
    {
        try {
            $user = Auth::user();

            // Vérifier si l'utilisateur a déjà un abonnement Pro Plus actif
            if ($user->hasProPlus()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà un abonnement Pro Plus actif'
                ], 400);
            }

            // Configuration PayPal
            $clientId = config('services.paypal.client_id');
            $secret = config('services.paypal.secret');
            $mode = config('services.paypal.mode', 'sandbox');
            $baseUrl = $mode === 'live'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            // Obtenir un token d'accès
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "$baseUrl/v1/oauth2/token");
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERPWD, $clientId . ":" . $secret);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");

            $result = curl_exec($ch);
            curl_close($ch);

            $token = json_decode($result)->access_token;

            // Créer l'abonnement Pro Plus
            $subscriptionData = [
                'plan_id' => config('services.paypal.pro_plus_plan_id'),
                'application_context' => [
                    'brand_name' => config('app.name'),
                    'locale' => 'fr-FR',
                    'shipping_preference' => 'NO_SHIPPING',
                    'user_action' => 'SUBSCRIBE_NOW',
                    'return_url' => env('FRONTEND_URL') . '/abonnement/paypal/success',
                    'cancel_url' => env('FRONTEND_URL') . '/abonnement/cancel'
                ],
                'custom_id' => json_encode([
                    'user_id' => $user->id,
                    'plan_type' => 'pro-plus'
                ])
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "$baseUrl/v1/billing/subscriptions");
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($subscriptionData));

            $result = curl_exec($ch);
            curl_close($ch);

            $subscription = json_decode($result);

            if (isset($subscription->id)) {
                $approvalUrl = collect($subscription->links)
                    ->firstWhere('rel', 'approve')
                    ->href ?? null;

                return response()->json([
                    'success' => true,
                    'subscription_id' => $subscription->id,
                    'approval_url' => $approvalUrl
                ]);
            }

            throw new \Exception('Erreur lors de la création de l\'abonnement PayPal');

        } catch (\Exception $e) {
            Log::error('Erreur PayPal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'abonnement PayPal'
            ], 500);
        }
    }

    /**
     * Webhook Stripe pour gérer les événements d'abonnement
     */
    public function abonnementStripeWebhook(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $endpoint_secret = config('services.stripe.webhook_secret');

        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Gérer les différents types d'événements
        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->handleStripeCheckoutCompleted($session);
                break;

            case 'customer.subscription.updated':
                $subscription = $event->data->object;
                $this->handleStripeSubscriptionUpdated($subscription);
                break;

            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $this->handleStripeSubscriptionDeleted($subscription);
                break;

            case 'invoice.payment_succeeded':
                $invoice = $event->data->object;
                $this->handleStripeInvoicePaymentSucceeded($invoice);
                break;

            case 'invoice.payment_failed':
                $invoice = $event->data->object;
                $this->handleStripeInvoicePaymentFailed($invoice);
                break;

            default:
                Log::info('Événement Stripe non géré: ' . $event->type);
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Webhook PayPal pour gérer les événements d'abonnement
     */
    public function abonnementPaypalWebhook(Request $request)
    {
        $payload = $request->all();
        $eventType = $payload['event_type'] ?? null;

        try {
            switch ($eventType) {
                case 'BILLING.SUBSCRIPTION.ACTIVATED':
                    $this->handlePaypalSubscriptionActivated($payload);
                    break;

                case 'BILLING.SUBSCRIPTION.UPDATED':
                    $this->handlePaypalSubscriptionUpdated($payload);
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
                    Log::info('Événement PayPal non géré: ' . $eventType);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Erreur webhook PayPal: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    // ========== Méthodes privées pour gérer les événements Stripe ==========

    private function handleStripeCheckoutCompleted($session)
    {
        try {
            $userId = $session->metadata->user_id ?? $session->client_reference_id;
            $planType = $session->metadata->plan_type ?? 'pro-plus';

            Log::info("Checkout Stripe complété pour l'utilisateur $userId - Plan: $planType");

            // Récupérer l'utilisateur
            $user = User::find($userId);
            if (!$user) {
                Log::error("Utilisateur $userId non trouvé");
                return;
            }

            // Annuler les anciens abonnements actifs de cet utilisateur
            $anciensAbonnements = $user->abonnements()
                ->where(function($query) {
                    $query->whereNull('date_fin')
                          ->orWhere('date_fin', '>', now());
                })
                ->get();

            foreach ($anciensAbonnements as $ancienAbo) {
                $ancienAbo->update(['date_fin' => now()]);
            }

            // Créer le nouvel abonnement Pro Plus
            $abonnement = Abonnement::create([
                'nom' => 'Pro Plus',
                'description' => 'Abonnement Pro Plus avec toutes les fonctionnalités premium',
                'stripe_subscription_id' => $session->subscription,
                'date_debut' => now(),
                'date_fin' => null,
            ]);

            // Créer l'opération qui lie l'utilisateur à l'abonnement (type_operation_id = 3)
            Operation::create([
                'user_id' => $userId,
                'event_id' => 1, // À adapter selon ton besoin
                'type_operation_id' => 3,
                'quantity' => 1,
                'abonnement_id' => $abonnement->abonnement_id,
            ]);

            Log::info("Abonnement Pro Plus créé avec succès - ID: {$abonnement->abonnement_id}");

        } catch (\Exception $e) {
            Log::error('Erreur handleStripeCheckoutCompleted: ' . $e->getMessage());
        }
    }

    private function handleStripeSubscriptionUpdated($subscription)
    {
        try {
            $abonnement = Abonnement::where('stripe_subscription_id', $subscription->id)->first();

            if ($abonnement) {
                // Mettre à jour la date de fin selon la période actuelle
                $dateFin = $subscription->current_period_end
                    ? date('Y-m-d H:i:s', $subscription->current_period_end)
                    : null;

                $abonnement->update([
                    'date_fin' => $dateFin
                ]);

                Log::info("Abonnement Stripe mis à jour: {$subscription->id}");
            }
        } catch (\Exception $e) {
            Log::error('Erreur handleStripeSubscriptionUpdated: ' . $e->getMessage());
        }
    }

    private function handleStripeSubscriptionDeleted($subscription)
    {
        try {
            $abonnement = Abonnement::where('stripe_subscription_id', $subscription->id)->first();

            if ($abonnement) {
                $abonnement->update([
                    'date_fin' => now()
                ]);

                Log::info("Abonnement Stripe annulé: {$subscription->id}");
            }
        } catch (\Exception $e) {
            Log::error('Erreur handleStripeSubscriptionDeleted: ' . $e->getMessage());
        }
    }

    private function handleStripeInvoicePaymentSucceeded($invoice)
    {
        Log::info("Paiement Stripe réussi pour la facture: {$invoice->id}");
    }

    private function handleStripeInvoicePaymentFailed($invoice)
    {
        Log::warning("Échec du paiement Stripe pour la facture: {$invoice->id}");

        // Optionnel: Notifier l'utilisateur
        $subscription = Abonnement::where('stripe_subscription_id', $invoice->subscription)->first();
        if ($subscription) {
            // Envoyer un email de notification
            Log::info("Notification à envoyer à l'utilisateur {$subscription->user_id}");
        }
    }

    // ========== Méthodes privées pour gérer les événements PayPal ==========

    private function handlePaypalSubscriptionActivated($payload)
    {
        try {
            $resource = $payload['resource'];
            $subscriptionId = $resource['id'];
            $customData = json_decode($resource['custom_id'] ?? '{}', true);

            $userId = $customData['user_id'] ?? null;
            $planType = $customData['plan_type'] ?? 'pro-plus';

            if (!$userId) {
                Log::error('User ID manquant dans le webhook PayPal');
                return;
            }

            Log::info("Abonnement PayPal activé pour l'utilisateur $userId - Plan: $planType");

            // Récupérer l'utilisateur
            $user = User::find($userId);
            if (!$user) {
                Log::error("Utilisateur $userId non trouvé");
                return;
            }

            // Annuler les anciens abonnements actifs de cet utilisateur
            $anciensAbonnements = $user->abonnements()
                ->where(function($query) {
                    $query->whereNull('date_fin')
                          ->orWhere('date_fin', '>', now());
                })
                ->get();

            foreach ($anciensAbonnements as $ancienAbo) {
                $ancienAbo->update(['date_fin' => now()]);
            }

            // Créer le nouvel abonnement Pro Plus
            $abonnement = Abonnement::create([
                'nom' => 'Pro Plus',
                'description' => 'Abonnement Pro Plus avec toutes les fonctionnalités premium',
                'paypal_subscription_id' => $subscriptionId,
                'date_debut' => now(),
                'date_fin' => null,
            ]);

            // Créer l'opération qui lie l'utilisateur à l'abonnement
            Operation::create([
                'user_id' => $userId,
                'event_id' => 1, // À adapter
                'type_operation_id' => 3,
                'quantity' => 1,
                'abonnement_id' => $abonnement->abonnement_id,
            ]);

            Log::info("Abonnement Pro Plus PayPal créé avec succès - ID: {$abonnement->abonnement_id}");

        } catch (\Exception $e) {
            Log::error('Erreur handlePaypalSubscriptionActivated: ' . $e->getMessage());
        }
    }

    private function handlePaypalSubscriptionUpdated($payload)
    {
        $subscriptionId = $payload['resource']['id'];
        Log::info("Abonnement PayPal mis à jour: $subscriptionId");
    }

    private function handlePaypalSubscriptionCancelled($payload)
    {
        try {
            $subscriptionId = $payload['resource']['id'];

            $abonnement = Abonnement::where('paypal_subscription_id', $subscriptionId)->first();

            if ($abonnement) {
                $abonnement->update([
                    'date_fin' => now()
                ]);

                Log::info("Abonnement PayPal annulé: $subscriptionId");
            }
        } catch (\Exception $e) {
            Log::error('Erreur handlePaypalSubscriptionCancelled: ' . $e->getMessage());
        }
    }

    private function handlePaypalSubscriptionSuspended($payload)
    {
        $subscriptionId = $payload['resource']['id'];
        Log::info("Abonnement PayPal suspendu: $subscriptionId");
    }

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
            $abonnement = $user->abonnementActif()->first();

            if (!$abonnement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun abonnement actif trouvé'
                ], 404);
            }

            // Annuler sur Stripe
            if ($abonnement->stripe_subscription_id) {
                Stripe::setApiKey(config('services.stripe.secret'));
                \Stripe\Subscription::update(
                    $abonnement->stripe_subscription_id,
                    ['cancel_at_period_end' => true]
                );
            }

            // Annuler sur PayPal
            if ($abonnement->paypal_subscription_id) {
                // Implémenter l'annulation PayPal via API
                Log::info("Demande d'annulation PayPal: {$abonnement->paypal_subscription_id}");
            }

            return response()->json([
                'success' => true,
                'message' => 'Votre abonnement sera annulé à la fin de la période en cours'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur cancelAbonnement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de l\'abonnement'
            ], 500);
        }
    }

    /**
     * Obtenir les informations d'abonnement de l'utilisateur
     */
    public function getAbonnementInfo(Request $request)
    {
        $user = Auth::user();
        $abonnement = $user->abonnementActif()->first();

        return response()->json([
            'has_pro_plus' => $user->hasProPlus(),
            'has_active_subscription' => $user->hasActiveSubscription(),
            'subscription_type' => $user->getAbonnementType(),
            'end_date' => $user->getSubscriptionEndDate(),
            'expiring_soon' => $user->subscriptionExpiringSoon(),
            'details' => $abonnement
        ]);
    }

    public function checkSubscriptionStatus(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            $abonnement = $user->abonnementActif()->first();

            $response = [
                'success' => true,
                'has_subscription' => $user->hasActiveSubscription(),
                'has_pro_plus' => $user->hasProPlus(),
                'subscription_type' => $user->getAbonnementType(),
            ];

            if ($abonnement) {
                $response['subscription'] = [
                    'id' => $abonnement->abonnement_id,
                    'name' => $abonnement->nom,
                    'description' => $abonnement->description,
                    'start_date' => $abonnement->date_debut,
                    'end_date' => $abonnement->date_fin,
                    'is_active' => $abonnement->isActive(),
                    'stripe_subscription_id' => $abonnement->stripe_subscription_id,
                    'paypal_subscription_id' => $abonnement->paypal_subscription_id,
                    'expiring_soon' => $user->subscriptionExpiringSoon(),
                ];
            }

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Erreur checkSubscriptionStatus: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du statut'
            ], 500);
        }
    }
}
