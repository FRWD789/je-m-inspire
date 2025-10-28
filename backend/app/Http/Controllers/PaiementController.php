<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Paiement;
use App\Models\User;
use App\Http\Controllers\AbonnementController;
use App\Http\Resources\PaiementResource;
use App\Http\Resources\OperationResource;
use App\Traits\ApiResponse;
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
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
                'quantity' => 'required|integer|min:1|max:20',
            ]);

            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

            $event = Event::with(['localisation', 'categorie'])->findOrFail($validated['event_id']);
            $user = JWTAuth::user();
            $quantity = $validated['quantity'];
            $vendor = $event->creator;

            // Vérifications métier
            if ($event->available_places < $quantity) {
                return $this->errorResponse('Pas assez de places disponibles', 400);
            }

            if ($event->start_date <= now()) {
                return $this->errorResponse('Impossible de réserver un événement déjà commencé', 400);
            }

            // Calcul du montant
            $totalAmount = $quantity * $event->base_price;
            $amountCents = intval(round($totalAmount * 100));

            DB::beginTransaction();

            // Créer le paiement
            $paiement = Paiement::create([
                'total' => $totalAmount,
                'status' => 'pending',
                'type_paiement_id' => 1,
                'taux_commission' => $vendor->commission_rate ?? 0,
                'vendor_id' => $vendor->id ?? null,
                'session_id' => '',
                'paypal_id' => null,
                'paypal_capture_id' => null,
            ]);

            // Créer l'opération
            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2,
                'quantity' => $quantity,
                'paiement_id' => $paiement->paiement_id,
            ]);

            // Configuration de base pour la session Stripe
            $sessionParams = [
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'cad',
                        'product_data' => [
                            'name' => $event->name,
                            'description' => "$quantity place(s) pour {$event->name}",
                        ],
                        'unit_amount' => intval(round($event->base_price * 100)),
                    ],
                    'quantity' => $quantity,
                ]],
                'mode' => 'payment',
                'success_url' => env('FRONTEND_URL') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => env('FRONTEND_URL') . '/payment/cancel',
                'metadata' => [
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'operation_id' => $operation->id,
                    'payment_id' => $paiement->paiement_id,
                    'quantity' => $quantity,
                ],
            ];

            // ✅ STRIPE CONNECT : Si le vendor a Pro Plus + compte Stripe lié
            if ($vendor && $vendor->hasProPlus() && $vendor->stripeAccount_id) {
                $commissionAmount = intval(round($totalAmount * ($vendor->commission_rate / 100) * 100));

                // Paiement direct au vendor avec prélèvement de la commission
                $sessionParams['payment_intent_data'] = [
                    'application_fee_amount' => $commissionAmount,
                    'transfer_data' => [
                        'destination' => $vendor->stripeAccount_id,
                    ],
                ];

                Log::info('[Stripe Connect] Paiement avec commission', [
                    'vendor_id' => $vendor->id,
                    'total' => $totalAmount,
                    'commission' => $commissionAmount / 100,
                    'vendor_reçoit' => ($amountCents - $commissionAmount) / 100,
                ]);
            }

            // Créer la session Stripe
            $session = \Stripe\Checkout\Session::create($sessionParams);

            $paiement->update(['session_id' => $session->id]);

            DB::commit();

            return $this->successResponse([
                'session_id' => $session->id,
                'url' => $session->url,
                'payment_id' => $paiement->paiement_id,
            ], 'Session de paiement créée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur Stripe Checkout: ' . $e->getMessage());
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

            // Vérifications métier
            if ($event->available_places < $quantity) {
                return $this->errorResponse('Pas assez de places disponibles', 400);
            }

            if ($event->start_date <= now()) {
                return $this->errorResponse('Impossible de réserver un événement déjà commencé', 400);
            }

            DB::beginTransaction();

            $totalAmount = $quantity * $event->base_price;

            // Configuration PayPal
            $paypal = new PayPalClient;
            $paypal->setApiCredentials(config('paypal'));
            $token = $paypal->getAccessToken();
            $paypal->setAccessToken($token);

            // Créer le paiement
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

            // Créer l'opération
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
            ];

            // Si vendor avec Pro Plus et compte PayPal
            if ($vendor && $vendor->hasProPlus() && $vendor->paypalAccount_id) {
                $commissionAmount = $totalAmount * ($vendor->commission_rate / 100);

                $purchaseUnit["payee"] = [
                    "merchant_id" => $vendor->paypalAccount_id,
                ];

                $purchaseUnit["payment_instruction"] = [
                    "disbursement_mode" => "INSTANT",
                    "platform_fees" => [
                        [
                            "amount" => [
                                "currency_code" => "CAD",
                                "value" => number_format($commissionAmount, 2, '.', '')
                            ]
                        ]
                    ]
                ];
            }

            $response = $paypal->createOrder([
                "intent" => "CAPTURE",
                "application_context" => [
                    'return_url' => env('FRONTEND_URL') . '/payment/success?payment_id=' . $paiement->paiement_id,
                    'cancel_url' => env('FRONTEND_URL') . '/payment/cancel',
                ],
                "purchase_units" => [$purchaseUnit]
            ]);

            if (isset($response['id'])) {
                $paiement->update(['paypal_id' => $response['id']]);
            }

            $approveUrl = null;
            foreach ($response['links'] ?? [] as $link) {
                if ($link['rel'] === 'approve') {
                    $approveUrl = $link['href'];
                    break;
                }
            }

            DB::commit();

            return $this->successResponse([
                'order_id' => $response['id'],
                'approval_url' => $approveUrl,
                'payment_id' => $paiement->paiement_id,
            ], 'Commande PayPal créée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur PayPal Checkout: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création de la commande PayPal', 500);
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
            Log::error('Webhook Stripe signature invalide: ' . $e->getMessage());
            return response('Webhook signature verification failed', 400);
        }

        Log::info("Webhook Stripe reçu: {$event->type}");

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->handleStripeCheckoutCompleted($session);
                break;

            case 'checkout.session.expired':
                $session = $event->data->object;
                $this->handleStripeCheckoutExpired($session);
                break;

            default:
                Log::info("Événement Stripe non géré: {$event->type}");
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
        Log::info("Webhook PayPal reçu : " . json_encode($payload));

        response()->json(['status' => 'success'], 200)->send();

        $event = $payload['event_type'] ?? null;

        switch ($event) {
            case 'CHECKOUT.ORDER.APPROVED':
                $this->handlePaypalOrderApproved($payload);
                break;

            case 'PAYMENT.CAPTURE.COMPLETED':
                $this->handlePaypalCaptureCompleted($payload);
                break;

            default:
                Log::info('Événement PayPal non géré: ' . $event);
        }

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Gérer l'ordre PayPal approuvé et capturer automatiquement
     */
    private function handlePaypalOrderApproved($payload)
    {
        try {
            $orderId = $payload['resource']['id'] ?? null;

            if (!$orderId) {
                Log::error('[PayPal] Order ID manquant dans le webhook');
                return;
            }

            Log::info("[PayPal] Commande approuvée: $orderId");

            // Mettre à jour le statut à "pending"
            $paiement = Paiement::where('paypal_id', $orderId)->first();

            if (!$paiement) {
                Log::warning("[PayPal] Paiement non trouvé pour order_id: $orderId");
                return;
            }

            $paiement->update([
                'status' => 'pending',
                'updated_at' => now(),
            ]);

            Log::info("Paiement $orderId en pending");

            // ✅ Capturer automatiquement le paiement
            $paypal = new PayPalClient;
            $paypal->setApiCredentials(config('paypal'));
            $token = $paypal->getAccessToken();
            $paypal->setAccessToken($token);

            $capture = $paypal->capturePaymentOrder($orderId);

            if ($capture['status'] === 'COMPLETED') {
                $captureId = $capture['purchase_units'][0]['payments']['captures'][0]['id'] ?? null;
                $amount = $capture['purchase_units'][0]['payments']['captures'][0]['amount']['value'] ?? 0;

                // ✅ Traiter le paiement immédiatement
                $this->handlePaypalPaymentSuccess($paiement, $capture, $captureId);

                Log::info("✅ Paiement $orderId capturé automatiquement pour $amount", [
                    'capture_id' => $captureId
                ]);
            }

        } catch (\Exception $e) {
            Log::error('[PayPal] Erreur handlePaypalOrderApproved: ' . $e->getMessage());
        }
    }

    /**
     * Gérer la capture PayPal complétée (webhook final de confirmation)
     */
    private function handlePaypalCaptureCompleted($payload)
    {
        try {
            $captureId = $payload['resource']['id'] ?? null;
            $orderId = $payload['resource']['supplementary_data']['related_ids']['order_id'] ?? null;
            $amount = $payload['resource']['amount']['value'] ?? 0;

            Log::info("[PayPal] Capture complétée", [
                'capture_id' => $captureId,
                'order_id' => $orderId,
                'amount' => $amount
            ]);

            // ✅ Chercher par ORDER_ID ou CAPTURE_ID
            $paiement = Paiement::where('paypal_id', $orderId)
                ->orWhere('paypal_capture_id', $captureId)
                ->first();

            if (!$paiement) {
                Log::warning("[PayPal] Paiement non trouvé pour order: $orderId / capture: $captureId");
                return;
            }

            // ✅ Si déjà payé, juste mettre à jour le capture_id si nécessaire
            if ($paiement->status === 'paid') {
                if (!$paiement->paypal_capture_id) {
                    $paiement->update([
                        'paypal_capture_id' => $captureId,
                        'updated_at' => now(),
                    ]);
                    Log::info("[PayPal] Capture ID ajouté au paiement déjà traité: {$paiement->paiement_id}");
                } else {
                    Log::info("[PayPal] Paiement déjà traité et complet: {$paiement->paiement_id}");
                }
                return;
            }

            // ✅ Si pas encore payé (cas où la capture automatique a échoué), traiter maintenant
            Log::warning("[PayPal] Paiement pas encore traité, traitement via webhook CAPTURE.COMPLETED");

            $this->handlePaypalPaymentSuccess($paiement, $payload, $captureId);

        } catch (\Exception $e) {
            Log::error('[PayPal] Erreur handlePaypalCaptureCompleted: ' . $e->getMessage());
        }
    }

    /**
     * Traiter le succès du paiement PayPal (appelé UNE SEULE FOIS)
     */
    private function handlePaypalPaymentSuccess(Paiement $paiement, $payload, $captureId = null)
    {
        try {
            DB::beginTransaction();

            // ✅ PROTECTION : Vérifier si déjà traité
            if ($paiement->status === 'paid') {
                DB::rollBack();
                Log::info("[PayPal] Paiement déjà traité, skip: {$paiement->paiement_id}");
                return;
            }

            $operation = Operation::where('paiement_id', $paiement->paiement_id)->first();

            if (!$operation) {
                Log::error('[PayPal] Opération non trouvée', [
                    'payment_id' => $paiement->paiement_id
                ]);
                DB::rollBack();
                return;
            }

            $event = $operation->event;

            // Vérifier les places disponibles
            if ($event->available_places >= $operation->quantity) {
                // Déduire les places
                $event->available_places -= $operation->quantity;
                $event->save();

                // Extraire le montant selon le format du payload
                $amount = null;
                if (isset($payload['purchase_units'][0]['payments']['captures'][0]['amount']['value'])) {
                    // Format: réponse de capture API
                    $amount = $payload['purchase_units'][0]['payments']['captures'][0]['amount']['value'];
                } elseif (isset($payload['resource']['amount']['value'])) {
                    // Format: webhook PAYMENT.CAPTURE.COMPLETED
                    $amount = $payload['resource']['amount']['value'];
                }

                // Marquer comme payé
                $paiement->update([
                    'status' => 'paid',
                    'paypal_capture_id' => $captureId,
                    'total' => $amount ?? $paiement->total,
                    'updated_at' => now(),
                ]);

                Log::info('✅ Paiement PayPal confirmé', [
                    'payment_id' => $paiement->paiement_id,
                    'operation_id' => $operation->id,
                    'quantity' => $operation->quantity,
                    'event_id' => $event->id,
                    'capture_id' => $captureId
                ]);
            } else {
                // Pas assez de places : remboursement
                $paiement->update([
                    'status' => 'refunded',
                    'updated_at' => now(),
                ]);
                $operation->delete();

                Log::warning('⚠️ Remboursement automatique PayPal - pas assez de places', [
                    'payment_id' => $paiement->paiement_id,
                    'places_demandees' => $operation->quantity,
                    'places_disponibles' => $event->available_places
                ]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[PayPal] Erreur traitement paiement', [
                'payment_id' => $paiement->paiement_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Gérer le succès du paiement Stripe
     */
    private function handleStripeCheckoutCompleted($session)
    {
        try {
            DB::beginTransaction();

            // ✅ Distinguer entre paiement d'événement et abonnement
            $planType = $session->metadata->plan_type ?? null;
            $paymentId = $session->metadata->payment_id ?? null;

            // Si c'est un abonnement, déléguer à AbonnementController
            if ($planType) {
                DB::rollBack();
                Log::info('[Stripe] Session d\'abonnement détectée, délégation à AbonnementController');

                $abonnementController = app(AbonnementController::class);
                $abonnementController->handleStripeCheckoutCompleted($session);
                return;
            }

            // Si pas de payment_id, c'est invalide
            if (!$paymentId) {
                Log::warning('[Stripe] Session sans payment_id ni plan_type - ignorée', [
                    'session_id' => $session->id,
                    'metadata' => (array) $session->metadata
                ]);
                DB::rollBack();
                return;
            }

            // ✅ Traiter le paiement d'événement normalement
            $paiement = Paiement::find($paymentId);

            if (!$paiement) {
                Log::error('[Stripe] Paiement non trouvé', ['payment_id' => $paymentId]);
                DB::rollBack();
                return;
            }

            if ($paiement->status === 'paid') {
                DB::rollBack();
                Log::info("[Stripe] Paiement déjà traité: $paymentId");
                return;
            }

            $operation = Operation::where('paiement_id', $paiement->paiement_id)->first();

            if (!$operation) {
                Log::error('[Stripe] Opération non trouvée', ['payment_id' => $paymentId]);
                DB::rollBack();
                return;
            }

            $event = $operation->event;

            // Vérifier les places disponibles
            if ($event->available_places >= $operation->quantity) {
                $event->available_places -= $operation->quantity;
                $event->save();

                $paiement->update([
                    'status' => 'paid',
                    'total' => ($session->amount_total ?? $paiement->total) / 100,
                ]);

                Log::info('✅ Paiement Stripe confirmé', [
                    'payment_id' => $paiement->paiement_id,
                    'session_id' => $session->id,
                    'quantity' => $operation->quantity
                ]);
            } else {
                $paiement->update(['status' => 'refunded']);
                $operation->delete();

                Log::warning('⚠️ Remboursement automatique Stripe - pas assez de places', [
                    'payment_id' => $paymentId
                ]);
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Stripe] Erreur handleStripeCheckoutCompleted: ' . $e->getMessage());
        }
    }

    /**
     * Gérer l'expiration de la session Stripe
     */
    private function handleStripeCheckoutExpired($session)
    {
        try {
            $paymentId = $session->metadata->payment_id ?? null;

            if (!$paymentId) {
                return;
            }

            $paiement = Paiement::find($paymentId);

            if ($paiement && $paiement->status === 'pending') {
                $paiement->update(['status' => 'expired']);
                Log::info("Session Stripe expirée: $paymentId");
            }

        } catch (\Exception $e) {
            Log::error('[Stripe] Erreur handleStripeCheckoutExpired: ' . $e->getMessage());
        }
    }

    /**
     * Récupérer le statut d'un paiement
     */
    public function getPaymentStatus(Request $request)
    {
        try {
            $paymentId = $request->query('payment_id');
            $sessionId = $request->query('session_id');

            if ($paymentId) {
                $paiement = Paiement::with(['operation.event.localisation', 'operation.event.categorie'])->find($paymentId);
            } elseif ($sessionId) {
                $paiement = Paiement::with(['operation.event.localisation', 'operation.event.categorie'])
                    ->where('session_id', $sessionId)
                    ->first();
            } else {
                return $this->errorResponse('payment_id ou session_id requis', 400);
            }

            if (!$paiement) {
                return $this->notFoundResponse('Paiement non trouvé');
            }

            return $this->successResponse([
                'payment' => new PaiementResource($paiement),
                'operation' => $paiement->operation
                    ? new OperationResource($paiement->operation)
                    : null
            ], 'Statut du paiement récupéré');

        } catch (\Exception $e) {
            Log::error('Erreur getPaymentStatus: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la récupération du statut', 500);
        }
    }
}
