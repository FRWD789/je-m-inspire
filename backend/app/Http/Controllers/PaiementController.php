<?php

namespace App\Http\Controllers;

use App\Http\Resources\PaiementResource;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Paiement;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use Tymon\JWTAuth\Facades\JWTAuth;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

class PaiementController extends Controller
{
    use ApiResponse;

    /**
     * Créer une session de paiement Stripe
     */
   public function stripeCheckout(Request $request)
    {
        try {
            // ✅ LOGIQUE INCHANGÉE
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'quantity' => 'required|integer|min:1|max:20',
            ]);

            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

            $event = Event::with(['localisation', 'categorie'])->findOrFail($validated['event_id']);
            $user = JWTAuth::user();
            $quantity = $validated['quantity'];
            $vendor = $event->creator;

            // ✅ LOGIQUE INCHANGÉE - Vérifications métier
            if ($event->available_places < $quantity) {
                return $this->errorResponse('Pas assez de places disponibles', 400);
            }

            if ($event->start_date <= now()) {
                return $this->errorResponse('Impossible de réserver un événement déjà commencé', 400);
            }

            // ✅ LOGIQUE INCHANGÉE - Calcul du montant
            $totalAmount = $quantity * $event->base_price;
            $amountCents = intval(round($totalAmount * 100));

            DB::beginTransaction();

            // ✅ LOGIQUE INCHANGÉE - Créer le paiement
            $paiement = Paiement::create([
                'total' => $totalAmount,
                'status' => 'pending',
                'type_paiement_id' => 1,
                'taux_commission' => $vendor->commission_rate ?? 0,
                'vendor_id' => $vendor->id ?? null,
                'session_id' => '',
            ]);

            // ✅ LOGIQUE INCHANGÉE - Créer l'opération
            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2,
                'quantity' => $quantity,
                'paiement_id' => $paiement->paiement_id,
            ]);

            // ✅ LOGIQUE INCHANGÉE - Créer la session Stripe
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'cad',
                        'product_data' => [
                            'name' => $event->name,
                            'description' => substr($event->description, 0, 200),
                        ],
                        'unit_amount' => intval(round($event->base_price * 100)),
                    ],
                    'quantity' => $quantity,
                ]],
                'mode' => 'payment',
                'success_url' => env('FRONTEND_URL') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => env('FRONTEND_URL') . '/payment/cancel',
                'client_reference_id' => $operation->id,
                'metadata' => [
                    'operation_id' => $operation->id,
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ]
            ]);

            // ✅ LOGIQUE INCHANGÉE - Mettre à jour le paiement
            $paiement->update(['session_id' => $session->id]);

            DB::commit();

            Log::info('Session Stripe créée', [
                'session_id' => $session->id,
                'operation_id' => $operation->id,
                'amount' => $totalAmount
            ]);

            // ✅ SEULEMENT LE RETURN MODIFIÉ
            return $this->successResponse([
                'session_id' => $session->id,
                'url' => $session->url,
                'operation_id' => $operation->id
            ], 'Session de paiement créée avec succès', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur Stripe checkout: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création de la session de paiement', 500);
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

            $event = Event::with(['localisation', 'categorie'])->findOrFail($validated['event_id']);
            $user = JWTAuth::user();
            $quantity = $validated['quantity'];
            $vendor = $event->creator;

            if ($event->available_places < $quantity) {
                return $this->errorResponse('Pas assez de places disponibles', 400);
            }

            if ($event->start_date <= now()) {
                return $this->errorResponse('Impossible de réserver un événement déjà commencé', 400);
            }

            DB::beginTransaction();

            $totalAmount = $quantity * $event->base_price;

            $paypal = new PayPalClient;
            $paypal->setApiCredentials(config('paypal'));
            $token = $paypal->getAccessToken();
            $paypal->setAccessToken($token);

            $paiement = Paiement::create([
                'total' => $totalAmount,
                'status' => 'pending',
                'type_paiement_id' => 1,
                'taux_commission' => $vendor->commission_rate ?? 0,
                'vendor_id' => $vendor->id ?? null,
                'session_id' => '',
                'paypal_id' => '',
                'paypal_capture_id' => null,
            ]);

            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2,
                'quantity' => $quantity,
                'paiement_id' => $paiement->paiement_id,
            ]);

            $purchaseUnit = [
                "amount" => [
                    "currency_code" => "CAD",
                    "value" => number_format($totalAmount, 2, '.', '')
                ],
                "description" => substr($event->name, 0, 127)
            ];

            $order = $paypal->createOrder([
                "intent" => "CAPTURE",
                "purchase_units" => [$purchaseUnit],
                "application_context" => [
                    "return_url" => env('FRONTEND_URL') . '/payment/success',
                    "cancel_url" => env('FRONTEND_URL') . '/payment/cancel',
                ]
            ]);

            if (isset($order['id'])) {
                $paiement->update(['paypal_id' => $order['id']]);
                DB::commit();

                $approvalUrl = null;
                foreach ($order['links'] as $link) {
                    if ($link['rel'] === 'approve') {
                        $approvalUrl = $link['href'];
                        break;
                    }
                }

                Log::info('Commande PayPal créée', [
                    'order_id' => $order['id'],
                    'operation_id' => $operation->id
                ]);

                return $this->successResponse([
                    'order_id' => $order['id'],
                    'approval_url' => $approvalUrl,
                    'operation_id' => $operation->id
                ], 'Commande PayPal créée avec succès', 201);
            }

            DB::rollBack();
            return $this->errorResponse('Erreur lors de la création de la commande PayPal', 500);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur PayPal checkout: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création de la commande', 500);
        }
    }

    /**
     * Webhook Stripe
     */
    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);

            Log::info('Webhook Stripe reçu', ['type' => $event->type]);

            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleStripeCheckoutCompleted($event->data->object);
                    break;

                case 'payment_intent.succeeded':
                    Log::info('PaymentIntent succeeded', ['id' => $event->data->object->id]);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handleStripePaymentFailed($event->data->object);
                    break;

                default:
                    Log::info('Type de webhook non géré', ['type' => $event->type]);
            }

            return $this->successResponse(null, 'Webhook traité');

        } catch (\Exception $e) {
            Log::error('Erreur webhook Stripe: ' . $e->getMessage());
            return $this->errorResponse('Erreur webhook', 400);
        }
    }

    /**
     * Gérer la complétion du checkout Stripe
     */
    private function handleStripeCheckoutCompleted($session)
    {
        try {
            DB::beginTransaction();

            $paiement = Paiement::where('session_id', $session->id)->first();

            if (!$paiement) {
                Log::warning('Paiement non trouvé pour session', ['session_id' => $session->id]);
                return;
            }

            $paiement->update(['status' => 'paid']);

            $operation = Operation::where('paiement_id', $paiement->paiement_id)->first();

            if ($operation) {
                $event = Event::find($operation->event_id);
                if ($event && $event->available_places >= $operation->quantity) {
                    $event->available_places -= $operation->quantity;
                    $event->save();
                }
            }

            DB::commit();

            Log::info('Paiement Stripe confirmé', [
                'paiement_id' => $paiement->paiement_id,
                'session_id' => $session->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur handleStripeCheckoutCompleted: ' . $e->getMessage());
        }
    }

    /**
     * Gérer l'échec du paiement Stripe
     */
    private function handleStripePaymentFailed($paymentIntent)
    {
        Log::error('Paiement Stripe échoué', ['payment_intent_id' => $paymentIntent->id]);
    }

    /**
     * Webhook PayPal
     */
    public function paypalWebhook(Request $request)
    {
        try {
            $payload = $request->all();
            $eventType = $payload['event_type'] ?? null;

            Log::info('Webhook PayPal reçu', ['type' => $eventType]);

            switch ($eventType) {
                case 'CHECKOUT.ORDER.APPROVED':
                    $this->handlePaypalOrderApproved($payload);
                    break;

                case 'PAYMENT.CAPTURE.COMPLETED':
                    $this->handlePaypalCaptureCompleted($payload);
                    break;

                case 'PAYMENT.CAPTURE.DENIED':
                    $this->handlePaypalCaptureDenied($payload);
                    break;

                default:
                    Log::info('Type de webhook PayPal non géré', ['type' => $eventType]);
            }

            return $this->successResponse(null, 'Webhook traité');

        } catch (\Exception $e) {
            Log::error('Erreur webhook PayPal: ' . $e->getMessage());
            return $this->errorResponse('Erreur webhook', 400);
        }
    }

    /**
     * Gérer l'approbation d'une commande PayPal
     */
    private function handlePaypalOrderApproved($payload)
    {
        $orderId = $payload['resource']['id'] ?? null;
        Log::info('Commande PayPal approuvée', ['order_id' => $orderId]);
    }

    /**
     * Gérer la complétion d'une capture PayPal
     */
    private function handlePaypalCaptureCompleted($payload)
    {
        try {
            DB::beginTransaction();

            $captureId = $payload['resource']['id'] ?? null;
            $orderId = $payload['resource']['supplementary_data']['related_ids']['order_id'] ?? null;

            $paiement = Paiement::where('paypal_id', $orderId)->first();

            if (!$paiement) {
                Log::warning('Paiement PayPal non trouvé', ['order_id' => $orderId]);
                return;
            }

            $paiement->update([
                'status' => 'paid',
                'paypal_capture_id' => $captureId
            ]);

            $operation = Operation::where('paiement_id', $paiement->paiement_id)->first();

            if ($operation) {
                $event = Event::find($operation->event_id);
                if ($event && $event->available_places >= $operation->quantity) {
                    $event->available_places -= $operation->quantity;
                    $event->save();
                }
            }

            DB::commit();

            Log::info('Paiement PayPal confirmé', [
                'paiement_id' => $paiement->paiement_id,
                'order_id' => $orderId
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur handlePaypalCaptureCompleted: ' . $e->getMessage());
        }
    }

    /**
     * Gérer le refus d'une capture PayPal
     */
    private function handlePaypalCaptureDenied($payload)
    {
        $orderId = $payload['resource']['supplementary_data']['related_ids']['order_id'] ?? null;
        Log::error('Capture PayPal refusée', ['order_id' => $orderId]);
    }

    /**
     * Récupérer le statut d'un paiement
     */
    public function getPaymentStatus(Request $request)
    {
        try {
            $sessionId = $request->query('session_id');
            $orderId = $request->query('order_id');

            if (!$sessionId && !$orderId) {
                return $this->errorResponse('session_id ou order_id requis', 400);
            }

            $paiement = null;

            if ($sessionId) {
                $paiement = Paiement::where('session_id', $sessionId)->first();
            } elseif ($orderId) {
                $paiement = Paiement::where('paypal_id', $orderId)->first();
            }

            if (!$paiement) {
                return $this->notFoundResponse('Paiement non trouvé');
            }

            $operation = $paiement->operation;
            $event = $operation ? $operation->event : null;

            return $this->successResponse([
                'paiement' => new PaiementResource($paiement),
                'operation' => $operation ? [
                    'id' => $operation->id,
                    'quantity' => $operation->quantity,
                    'event_name' => $event?->name,
                ] : null
            ], 'Statut du paiement récupéré');

        } catch (\Exception $e) {
            Log::error('Erreur getPaymentStatus: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération du statut', 500);
        }
    }
}
