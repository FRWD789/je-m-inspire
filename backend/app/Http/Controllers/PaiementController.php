<?php
// =============================================================================
// NETTOYAGE COMPLET DU PROJET LARAVEL - SYSTÈME SIMPLIFIÉ SANS ADULTE/ENFANT
// =============================================================================

/*
CHANGEMENTS EFFECTUÉS :
1. Suppression complète du concept adulte/enfant
2. Simplification du calcul des prix (prix unique par personne)
3. Refactorisation complète des controllers
4. Optimisation des models et relations
5. Corrections des migrations
6. API unifiée pour React
*/

// =============================================================================
// 1. PAIEMENTCONTROLLER.PHP - VERSION SIMPLIFIÉE
// =============================================================================

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Paiement;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use Tymon\JWTAuth\Facades\JWTAuth;

class PaiementController extends Controller
{
    /**
     * Créer une session de paiement Stripe
     */
    public function stripeCheckout(Request $request)
    {
        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'quantity' => 'required|integer|min:1|max:20', // Nombre de places
            ]);

            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

            $event = Event::with(['localisation', 'categorie'])->findOrFail($validated['event_id']);
            $user = JWTAuth::user();
            $quantity = $validated['quantity'];

            // Vérifications métier
            if ($event->available_places < $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pas assez de places disponibles',
                    'available_places' => $event->available_places,
                    'requested_places' => $quantity
                ], 400);
            }

            if ($event->start_date <= now()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de réserver un événement déjà commencé'
                ], 400);
            }

            // Calcul simplifié du montant
            $totalAmount = $quantity * $event->base_price;
            $amountCents = intval(round($totalAmount * 100));

            DB::beginTransaction();

            // Créer le paiement
            $paiement = Paiement::create([
                'total' => $totalAmount,
                'status' => 'pending',
                'type_paiement_id' => 1, // Paiement unique
                'taux_commission' => 0,
                'vendor_id' => $event->localisation_id ?? null,
                'session_id' => '', // Sera mis à jour
                'stripe_id' => '',
                'paypal_id' => '',
                'stripe_subscription_id' => '',
            ]);

            // Créer l'opération (réservation temporaire)
            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2, // Réservation
                'quantity' => $quantity, // Nombre de places réservées
                'paiement_id' => $paiement->paiement_id,
            ]);

            // Créer la session Stripe
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'EUR',
                        'product_data' => [
                            'name' => $event->name,
                            'description' => "Réservation de {$quantity} place(s) - " . ($event->localisation->name ?? '')
                        ],
                        'unit_amount' => intval($event->base_price * 100), // Prix unitaire
                    ],
                    'quantity' => $quantity,
                ]],
                'mode' => 'payment',
                'success_url' => env('FRONTEND_URL', 'http://localhost:3000') .
                               "/payment-result?session_id={CHECKOUT_SESSION_ID}&status=success",
                'cancel_url' => env('FRONTEND_URL', 'http://localhost:3000') .
                              "/payment-result?status=cancelled&payment_id=" . $paiement->paiement_id,
                'metadata' => [
                    'payment_id' => $paiement->paiement_id,
                    'operation_id' => $operation->id,
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'quantity' => $quantity,
                ]
            ]);

            // Mettre à jour le paiement avec l'ID de session
            $paiement->update(['session_id' => $session->id]);

            DB::commit();

            return response()->json([
                'success' => true,
                'checkout_url' => $session->url,
                'session_id' => $session->id,
                'payment_id' => $paiement->paiement_id,
                'total_amount' => $totalAmount,
                'quantity' => $quantity,
                'unit_price' => $event->base_price,
                'event' => [
                    'id' => $event->id,
                    'name' => $event->name,
                    'start_date' => $event->start_date,
                    'localisation' => $event->localisation->name ?? null
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur Stripe checkout', [
                'user_id' => auth()->id() ?? null,
                'event_id' => $validated['event_id'] ?? null,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du paiement',
                'error' => app()->isProduction() ? 'Erreur interne' : $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une commande PayPal
     */
    public function paypalCheckout(Request $request)
    {
        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'quantity' => 'required|integer|min:1|max:20',
            ]);

            $paypal = new PayPalClient;
            $paypal->setApiCredentials(config('paypal'));
            $token = $paypal->getAccessToken();

            if (!$token) {
                throw new \Exception('Impossible de se connecter à PayPal');
            }

            $event = Event::with(['localisation', 'categorie'])->findOrFail($validated['event_id']);
            $user = JWTAuth::user();
            $quantity = $validated['quantity'];

            // Vérifications métier
            if ($event->available_places < $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pas assez de places disponibles',
                    'available_places' => $event->available_places,
                    'requested_places' => $quantity
                ], 400);
            }

            if ($event->start_date <= now()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de réserver un événement déjà commencé'
                ], 400);
            }

            $totalAmount = $quantity * $event->base_price;

            DB::beginTransaction();

            // Créer le paiement
            $paiement = Paiement::create([
                'total' => $totalAmount,
                'status' => 'pending',
                'type_paiement_id' => 1,
                'taux_commission' => 0,
                'vendor_id' => $event->localisation_id ?? null,
                'session_id' => '',
                'stripe_id' => '',
                'paypal_id' => '', // Sera mis à jour
                'stripe_subscription_id' => '',
            ]);

            // Créer l'opération
            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2,
                'quantity' => $quantity,
                'paiement_id' => $paiement->paiement_id,
            ]);

            // Créer la commande PayPal
            $response = $paypal->createOrder([
                "intent" => "CAPTURE",
                "application_context" => [
                    "return_url" => env('FRONTEND_URL', 'http://localhost:3000') .
                                  "/payment-result?provider=paypal&payment_id=" . $paiement->paiement_id . "&status=success",
                    "cancel_url" => env('FRONTEND_URL', 'http://localhost:3000') .
                                  "/payment-result?provider=paypal&payment_id=" . $paiement->paiement_id . "&status=cancelled",
                ],
                "purchase_units" => [[
                    "amount" => [
                        "currency_code" => "EUR",
                        "value" => number_format($totalAmount, 2, '.', '')
                    ],
                    "description" => "Réservation de {$quantity} place(s) - {$event->name}"
                ]]
            ]);

            if (isset($response['id'])) {
                $paiement->update(['paypal_id' => $response['id']]);
            }

            // Récupérer l'URL d'approbation PayPal
            $approveUrl = null;
            foreach ($response['links'] ?? [] as $link) {
                if ($link['rel'] === 'approve') {
                    $approveUrl = $link['href'];
                    break;
                }
            }

            DB::commit();

            if ($approveUrl) {
                return response()->json([
                    'success' => true,
                    'approve_url' => $approveUrl,
                    'payment_id' => $paiement->paiement_id,
                    'total_amount' => $totalAmount,
                    'quantity' => $quantity,
                    'unit_price' => $event->base_price,
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->name,
                        'start_date' => $event->start_date,
                        'localisation' => $event->localisation->name ?? null
                    ]
                ]);
            }

            throw new \Exception('Aucun lien d\'approbation PayPal trouvé');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur PayPal checkout', [
                'user_id' => auth()->id() ?? null,
                'event_id' => $validated['event_id'] ?? null,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du paiement PayPal',
                'error' => app()->isProduction() ? 'Erreur interne' : $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook Stripe
     */
    public function stripeWebhook(Request $request)
    {
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\Exception $e) {
            Log::error('Erreur webhook Stripe', ['error' => $e->getMessage()]);
            return response('', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->handleStripePaymentSuccess($session);
                break;

            case 'checkout.session.expired':
                $session = $event->data->object;
                $this->handleStripePaymentExpired($session);
                break;

            default:
                Log::info('Événement Stripe non géré : ' . $event->type);
                break;
        }

        return response('Webhook traité', 200);
    }

    /**
     * Webhook PayPal
     */
    public function paypalWebhook(Request $request)
    {
        $payload = $request->all();
        $eventType = $payload['event_type'] ?? null;
        $paypalId = $payload['resource']['id'] ?? null;

        if (!$paypalId) {
            return response()->json(['status' => 'ignored'], 200);
        }

        $paiement = Paiement::where('paypal_id', $paypalId)->first();

        switch ($eventType) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                if ($paiement) {
                    $this->handlePaypalPaymentSuccess($paiement, $payload);
                }
                break;

            case 'PAYMENT.CAPTURE.DENIED':
            case 'PAYMENT.CAPTURE.FAILED':
                if ($paiement) {
                    $this->handlePaypalPaymentFailed($paiement);
                }
                break;

            default:
                Log::info("Événement PayPal non géré : {$eventType}");
                break;
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Traiter un paiement Stripe réussi
     */
    private function handleStripePaymentSuccess($session)
    {
        try {
            DB::beginTransaction();

            $paiement = Paiement::where('session_id', $session->id)->first();

            if (!$paiement || $paiement->status === 'paid') {
                DB::rollBack();
                return; // Déjà traité
            }

            $operation = Operation::where('paiement_id', $paiement->paiement_id)->first();

            if (!$operation) {
                Log::error('Opération non trouvée pour le paiement', ['payment_id' => $paiement->paiement_id]);
                DB::rollBack();
                return;
            }

            $event = $operation->event;

            // Vérifier qu'il y a encore assez de places
            if ($event->available_places >= $operation->quantity) {
                // Déduire les places de l'événement
                $event->available_places -= $operation->quantity;
                $event->save();

                // Marquer le paiement comme payé
                $paiement->update([
                    'status' => 'paid',
                    'total' => ($session->amount_total ?? 0) / 100,
                ]);

                Log::info('Paiement Stripe confirmé', [
                    'payment_id' => $paiement->paiement_id,
                    'operation_id' => $operation->id,
                    'quantity' => $operation->quantity,
                    'event_id' => $event->id
                ]);
            } else {
                // Pas assez de places : remboursement automatique
                $paiement->update(['status' => 'refunded']);
                $operation->delete();

                Log::warning('Remboursement automatique - pas assez de places', [
                    'payment_id' => $paiement->paiement_id,
                    'places_demandees' => $operation->quantity,
                    'places_disponibles' => $event->available_places
                ]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur traitement paiement Stripe', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Traiter un paiement Stripe expiré
     */
    private function handleStripePaymentExpired($session)
    {
        try {
            DB::beginTransaction();

            $paiement = Paiement::where('session_id', $session->id)->first();

            if ($paiement && $paiement->status === 'pending') {
                $paiement->update(['status' => 'expired']);

                // Supprimer l'opération temporaire
                Operation::where('paiement_id', $paiement->paiement_id)->delete();
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur expiration paiement Stripe', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Traiter un paiement PayPal réussi
     */
    private function handlePaypalPaymentSuccess($paiement, $payload)
    {
        try {
            DB::beginTransaction();

            if ($paiement->status === 'paid') {
                DB::rollBack();
                return; // Déjà traité
            }

            $operation = Operation::where('paiement_id', $paiement->paiement_id)->first();

            if (!$operation) {
                Log::error('Opération non trouvée pour le paiement PayPal', ['payment_id' => $paiement->paiement_id]);
                DB::rollBack();
                return;
            }

            $event = $operation->event;

            // Vérifier qu'il y a encore assez de places
            if ($event->available_places >= $operation->quantity) {
                // Déduire les places
                $event->available_places -= $operation->quantity;
                $event->save();

                // Marquer comme payé
                $paiement->update([
                    'status' => 'paid',
                    'total' => $payload['resource']['amount']['value'] ?? $paiement->total,
                ]);

                Log::info('Paiement PayPal confirmé', [
                    'payment_id' => $paiement->paiement_id,
                    'operation_id' => $operation->id,
                    'quantity' => $operation->quantity,
                    'event_id' => $event->id
                ]);
            } else {
                // Remboursement nécessaire
                $paiement->update(['status' => 'refunded']);
                $operation->delete();

                Log::warning('Remboursement automatique PayPal - pas assez de places', [
                    'payment_id' => $paiement->paiement_id,
                    'places_demandees' => $operation->quantity,
                    'places_disponibles' => $event->available_places
                ]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur traitement paiement PayPal', [
                'payment_id' => $paiement->paiement_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Traiter un paiement PayPal échoué
     */
    private function handlePaypalPaymentFailed($paiement)
    {
        try {
            DB::beginTransaction();

            $paiement->update(['status' => 'failed']);

            // Supprimer l'opération temporaire
            Operation::where('paiement_id', $paiement->paiement_id)->delete();

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur échec paiement PayPal', [
                'payment_id' => $paiement->paiement_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Récupérer le statut d'un paiement (pour React)
     */
    public function getPaymentStatus(Request $request)
    {
        try {
            $sessionId = $request->get('session_id');
            $paymentId = $request->get('payment_id');

            $paiement = null;

            if ($sessionId) {
                $paiement = Paiement::where('session_id', $sessionId)->first();
            } elseif ($paymentId) {
                $paiement = Paiement::where('paiement_id', $paymentId)->first();
            }

            if (!$paiement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non trouvé'
                ], 404);
            }

            // Charger l'opération avec l'événement
            $operation = Operation::with(['event.localisation', 'event.categorie'])->where('paiement_id', $paiement->paiement_id)->first();

            return response()->json([
                'success' => true,
                'payment' => [
                    'id' => $paiement->paiement_id,
                    'total' => $paiement->total,
                    'status' => $paiement->status,
                    'type' => 'one_time',
                    'created_at' => $paiement->created_at,
                    'event' => $operation ? [
                        'id' => $operation->event->id,
                        'name' => $operation->event->name,
                        'start_date' => $operation->event->start_date,
                        'localisation' => $operation->event->localisation->name ?? null,
                        'base_price' => $operation->event->base_price,
                    ] : null,
                    'quantity' => $operation ? $operation->quantity : 0,
                    'unit_price' => $operation ? $operation->event->base_price : 0,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération statut paiement', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du statut'
            ], 500);
        }
    }
}
