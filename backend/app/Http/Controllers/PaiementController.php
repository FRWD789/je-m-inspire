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
        $debug = config('app.debug');

        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
            ]);

            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            $event = Event::with(['localisation', 'categorie'])->findOrFail($validated['event_id']);
            $user = JWTAuth::user();
            $vendor = $event->creator;

            DB::beginTransaction();

            // ✅ VALIDATION 1: Vérifier que l'événement n'est pas passé
            if ($event->start_date <= now()) {
                DB::rollBack();
                return $this->errorResponse('Impossible de réserver un événement déjà commencé ou passé', 422);
            }

            // ✅ VALIDATION 2: Vérifier les places disponibles
            if ($event->available_places < 1) {
                DB::rollBack();
                return $this->errorResponse('Pas assez de places disponibles', 422);
            }

            // ✅ VALIDATION 3: Vérifier doublon avec gestion intelligente
            $existingReservation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2
            ])->first();

            if ($existingReservation) {
                // Si paiement payé → bloquer
                if ($existingReservation->paiement && $existingReservation->paiement->status === 'paid') {
                    DB::rollBack();
                    return $this->errorResponse('Vous avez déjà une réservation payée pour cet événement', 422);
                }

                // Si paiement en attente depuis < 15 min → bloquer temporairement
                if ($existingReservation->paiement &&
                    $existingReservation->paiement->status === 'pending' &&
                    $existingReservation->created_at->gt(now()->subMinutes(15))) {
                    DB::rollBack();
                    return $this->errorResponse('Une réservation est en cours de traitement. Veuillez patienter quelques minutes.', 422);
                }

                // Sinon → supprimer l'ancienne (paiement échoué ou expiré)
                if ($debug) {
                    Log::info('[Stripe] Suppression réservation obsolète', [
                        'operation_id' => $existingReservation->id,
                        'user_id' => $user->id,
                        'event_id' => $event->id,
                        'paiement_status' => $existingReservation->paiement?->status ?? 'aucun'
                    ]);
                }
                $existingReservation->delete();
            }

            // Calcul du montant
            $totalAmount = $event->base_price;
            $amountCents = intval(round($totalAmount * 100));

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
                'paiement_id' => $paiement->paiement_id,
            ]);

            // ✅ CORRECTION: Décrémenter les places UNE SEULE FOIS ici
            // Cela réserve la place immédiatement et évite les problèmes
            $event->available_places -= 1;
            $event->save();

            // Configuration de base pour la session Stripe
            $sessionParams = [
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'cad',
                        'product_data' => [
                            'name' => $event->name,
                            'description' => "1 place pour {$event->name}",
                        ],
                        'unit_amount' => $amountCents,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('app.frontend_url') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url') . '/payment/cancel',
                'customer_email' => $user->email,
                'metadata' => [
                    'payment_id' => $paiement->paiement_id,
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                ],
            ];

            // Gestion commission vendor avec Stripe Connect
            $hasProPlus = $vendor && $vendor->hasProPlus();
            $hasStripeAccount = $vendor && !empty($vendor->stripeAccount_id);

            if ($hasProPlus && $hasStripeAccount) {
                $commissionAmount = intval(round(($totalAmount * ($vendor->commission_rate / 100)) * 100));
                $sessionParams['payment_intent_data'] = [
                    'application_fee_amount' => $commissionAmount,
                    'transfer_data' => [
                        'destination' => $vendor->stripeAccount_id,
                    ],
                ];
            }

            $session = Session::create($sessionParams);

            $paiement->update(['session_id' => $session->id]);

            DB::commit();

            if ($debug) {
                Log::info('[Stripe] Session créée avec validation', [
                    'session_id' => $session->id,
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'operation_id' => $operation->id,
                    'places_restantes' => $event->available_places
                ]);
            }

            return $this->successResponse([
                'url' => $session->url,
                'session_id' => $session->id,
                'payment_id' => $paiement->paiement_id,
            ], 'Session de paiement créée avec succès');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Stripe] Erreur Checkout: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création de la session de paiement', 500);
        }
    }

    /**
     * Créer une commande PayPal
     */
    public function paypalCheckout(Request $request)
    {
        $debug = config('app.debug');

        try {
            $validated = $request->validate([
                'event_id' => 'required|exists:events,id',
            ]);

            $event = Event::with(['localisation', 'categorie'])->findOrFail($validated['event_id']);
            $user = JWTAuth::user();
            $vendor = $event->creator;

            DB::beginTransaction();

            // ✅ VALIDATION 1: Vérifier que l'événement n'est pas passé
            if ($event->start_date <= now()) {
                DB::rollBack();
                return $this->errorResponse('Impossible de réserver un événement déjà commencé ou passé', 422);
            }

            // ✅ VALIDATION 2: Vérifier les places disponibles
            if ($event->available_places < 1) {
                DB::rollBack();
                return $this->errorResponse('Pas assez de places disponibles', 422);
            }

            // ✅ VALIDATION 3: Vérifier doublon avec gestion intelligente
            $existingReservation = Operation::where([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2
            ])->first();

            if ($existingReservation) {
                // Si paiement payé → bloquer
                if ($existingReservation->paiement && $existingReservation->paiement->status === 'paid') {
                    DB::rollBack();
                    return $this->errorResponse('Vous avez déjà une réservation payée pour cet événement', 422);
                }

                // Si paiement en attente depuis < 15 min → bloquer temporairement
                if ($existingReservation->paiement &&
                    $existingReservation->paiement->status === 'pending' &&
                    $existingReservation->created_at->gt(now()->subMinutes(15))) {
                    DB::rollBack();
                    return $this->errorResponse('Une réservation est en cours de traitement. Veuillez patienter quelques minutes.', 422);
                }

                // Sinon → supprimer l'ancienne (paiement échoué ou expiré)
                if ($debug) {
                    Log::info('[PayPal] Suppression réservation obsolète', [
                        'operation_id' => $existingReservation->id,
                        'user_id' => $user->id,
                        'event_id' => $event->id,
                        'paiement_status' => $existingReservation->paiement?->status ?? 'aucun'
                    ]);
                }
                $existingReservation->delete();
            }

            $totalAmount = $event->base_price;

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
                'paiement_id' => $paiement->paiement_id,
            ]);

            // ✅ CORRECTION: Décrémenter les places UNE SEULE FOIS ici
            // Cela réserve la place immédiatement et évite les problèmes
            $event->available_places -= 1;
            $event->save();

            $purchaseUnit = [
                "amount" => [
                    "currency_code" => "CAD",
                    "value" => number_format($totalAmount, 2, '.', ''),
                ],
                "description" => "1 place pour {$event->name}",
            ];

            // Gestion commission vendor avec PayPal
            $hasProPlus = $vendor && $vendor->hasProPlus();
            $hasPaypalAccount = $vendor && !empty($vendor->paypalAccount_id);

            if ($hasProPlus && $hasPaypalAccount && config('paypal.mode') === 'live') {
                $commissionAmount = number_format($totalAmount * ($vendor->commission_rate / 100), 2, '.', '');
                $purchaseUnit['payment_instruction'] = [
                    'disbursement_mode' => 'INSTANT',
                    'platform_fees' => [[
                        'amount' => [
                            'currency_code' => 'CAD',
                            'value' => $commissionAmount,
                        ],
                    ]],
                ];
                $purchaseUnit['payee'] = [
                    'merchant_id' => $vendor->paypalAccount_id,
                ];
            }

            $response = $paypal->createOrder([
                'intent' => 'CAPTURE',
                'application_context' => [
                    'return_url' => config('app.frontend_url') . '/payment/success?payment_id=' . $paiement->paiement_id,
                    'cancel_url' => config('app.frontend_url') . '/payment/cancel',
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

            if ($debug) {
                Log::info('[PayPal] Commande créée avec validation', [
                    'order_id' => $response['id'],
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'operation_id' => $operation->id,
                    'places_restantes' => $event->available_places
                ]);
            }

            return $this->successResponse([
                'order_id' => $response['id'],
                'approval_url' => $approveUrl,
                'payment_id' => $paiement->paiement_id,
            ], 'Commande PayPal créée avec succès');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[PayPal] Erreur Checkout: ' . $e->getMessage());
            return $this->errorResponse('Erreur lors de la création de la commande PayPal', 500);
        }
    }

    /**
     * Webhook Stripe
     */
    public function stripeWebhook(Request $request)
    {
        $endpoint_secret = config('services.stripe.webhook_secret');
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
     * ✅ CORRECTION: Ne plus décrémenter les places ici - déjà fait au checkout
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

            // Extraire le montant selon le format du payload
            $amount = null;
            if (isset($payload['purchase_units'][0]['payments']['captures'][0]['amount']['value'])) {
                // Format: réponse de capture API
                $amount = $payload['purchase_units'][0]['payments']['captures'][0]['amount']['value'];
            } elseif (isset($payload['resource']['amount']['value'])) {
                // Format: webhook PAYMENT.CAPTURE.COMPLETED
                $amount = $payload['resource']['amount']['value'];
            }

            // ✅ CORRECTION: Marquer simplement comme payé
            // Les places ont déjà été décrémentées lors de la création du checkout
            $paiement->update([
                'status' => 'paid',
                'paypal_capture_id' => $captureId,
                'total' => $amount ?? $paiement->total,
                'updated_at' => now(),
            ]);

            Log::info('✅ Paiement PayPal confirmé', [
                'payment_id' => $paiement->paiement_id,
                'operation_id' => $operation->id,
                'event_id' => $event->id,
                'capture_id' => $captureId,
                'places_restantes' => $event->available_places
            ]);

            DB::commit();

            // ✅ Envoyer l'email de confirmation de réservation
            try {
                // Charger toutes les relations nécessaires pour l'email
                $operation->load(['event.localisation', 'paiement', 'user']);

                $operation->user->notify(new \App\Notifications\ReservationConfirmedNotification($operation));

                Log::info('[PayPal] Email de confirmation envoyé', [
                    'payment_id' => $paiement->paiement_id,
                    'user_id' => $operation->user_id,
                    'user_email' => $operation->user->email
                ]);
            } catch (\Exception $e) {
                // Ne pas faire échouer le paiement si l'email échoue
                Log::error('[PayPal] Erreur envoi email de confirmation', [
                    'payment_id' => $paiement->paiement_id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }

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
     * ✅ CORRECTION: Ne plus décrémenter les places ici - déjà fait au checkout
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

            // ✅ CORRECTION: Marquer simplement comme payé
            // Les places ont déjà été décrémentées lors de la création du checkout
            $paiement->update([
                'status' => 'paid',
                'total' => ($session->amount_total ?? $paiement->total) / 100,
            ]);

            Log::info('✅ Paiement Stripe confirmé', [
                'payment_id' => $paiement->paiement_id,
                'session_id' => $session->id,
                'event_id' => $event->id,
                'places_restantes' => $event->available_places
            ]);

            DB::commit();

            // ✅ Envoyer l'email de confirmation de réservation
            try {
                // Charger toutes les relations nécessaires pour l'email
                $operation->load(['event.localisation', 'paiement', 'user']);

                $operation->user->notify(new \App\Notifications\ReservationConfirmedNotification($operation));

                Log::info('[Stripe] Email de confirmation envoyé', [
                    'payment_id' => $paiement->paiement_id,
                    'user_id' => $operation->user_id,
                    'user_email' => $operation->user->email
                ]);
            } catch (\Exception $e) {
                // Ne pas faire échouer le paiement si l'email échoue
                Log::error('[Stripe] Erreur envoi email de confirmation', [
                    'payment_id' => $paiement->paiement_id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }

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
