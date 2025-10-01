<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Paiement;
use App\Models\User;
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
            $vendor = $event->creator;


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
                'taux_commission' => $vendor->commission_rate ?? 0,
                'vendor_id' => $vendor->id ?? null,
                'session_id' => '', // Sera mis à jour
                'paypal_id' => '',
            ]);

            // Créer l'opération (réservation temporaire)
            $operation = Operation::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'type_operation_id' => 2, // Réservation
                'quantity' => $quantity, // Nombre de places réservées
                'paiement_id' => $paiement->paiement_id,
            ]);

            $sessionData = [
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'CAD',
                        'product_data' => [
                            'name' => $event->name,
                            'description' => "Réservation de {$quantity} place(s) - " . ($event->localisation->name ?? '')
                        ],
                        'unit_amount' => intval($event->base_price * 100),
                    ],
                    'quantity' => $quantity,
                ]],
                'mode' => 'payment',
                'success_url' => env('FRONTEND_URL') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => env('FRONTEND_URL') . '/payment/cancel',
                'metadata'    => [
                    'payment_id'   => $paiement->paiement_id,
                    'operation_id' => $operation->id,
                    'event_id'     => $event->id,
                    'user_id'      => $user->id,
                    'quantity'     => $quantity,
                ],
            ];

            // Ajout commission si vendor éligible
            if ($vendor && $vendor->hasProPlus() && $vendor->hasStripeLinked()) {
                $applicationFee = intval(($amountCents * $vendor->commission_rate) / 100);
                log::info('stripe oui');
                $sessionData['payment_intent_data'] = [
                    'application_fee_amount' => $applicationFee,
                    'transfer_data' => [
                        'destination' => $vendor->stripeAccount_id,
                    ],
                ];
            }

            $session = \Stripe\Checkout\Session::create($sessionData);

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
            $vendor = $event->creator;

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
                'taux_commission' => $event->creator->commission_rate ?? 0,
                'vendor_id' => $event->creator->id ?? null,
                'session_id' => '',
                'paypal_id' => '', // Sera mis à jour
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

            // Si un vendor est lié et qu’il a une commission
            if ($vendor && $vendor->hasProPlus() && $vendor->paypalAccountId) {
                $commissionAmount = $amount * ($vendor->commission_rate / 100);
                $vendorAmount = $amount - $commissionAmount;
                log::info('paypal oui');

                $purchaseUnit["payee"] = [
                    "merchant_id" => $vendor->paypalAccount_id, // compte PayPal du vendeur
                ];

                // Optional: ajouter la commission à la plateforme via 'payment_instruction'
                $purchaseUnit["payment_instruction"] = [
                    "disbursement_mode" => "INSTANT", // ou "DELAYED" si tu veux capturer plus tard
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
        $event = null;

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\UnexpectedValueException $e) {
            // Payload invalide
            Log::error('Stripe webhook payload invalide', ['error' => $e->getMessage()]);
            return response('', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Signature invalide
            Log::error('Stripe webhook signature invalide', ['error' => $e->getMessage()]);
            return response('', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':

                $session = $event->data->object;
                log::info("id: " . $session->id);
                $paiement = Paiement::where('session_id', $session->id)->first();

                $amount = ($session->amount_total ?? 0) / 100;
                    $paiement->update([
                        'status' => 'paid',
                        'total' => $amount,
                    ]);

                // Finaliser la réservation (déduire les places)
                $this->handleStripePaymentSuccess($session);

                Log::info("Webhook checkout.session.completed traité pour session {$session->id}");
                break;

            case 'checkout.session.expired':
                $session = $event->data->object;
                $this->handleStripePaymentExpired($session);
                Log::info("Webhook checkout.session.expired traité pour session {$session->id}");
                break;

            default:
                Log::info("Événement Stripe non géré : " . $event->type);
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
        $paypalId = $payload['resource']['id'] ?? null;

        switch ($event) {
            case 'CHECKOUT.ORDER.APPROVED':
                Paiement::where('paypal_id', $paypalId)->update([
                    'status' => 'pending',
                    'updated_at' => now(),
                ]);
                Log::info("Paiement $paypalId en pending");

                // Capturer le paiement
                $paypal = new \Srmklive\PayPal\Services\PayPal;
                $paypal->setApiCredentials(config('paypal'));
                $token = $paypal->getAccessToken();
                $paypal->setAccessToken($token);

                try {
                    $capture = $paypal->capturePaymentOrder($paypalId);

                    if ($capture['status'] === 'COMPLETED') {
                        $amount = $capture['purchase_units'][0]['payments']['captures'][0]['amount']['value'] ?? null;

                        $paiement = Paiement::where('paypal_id', $paypalId)->firstOrFail();

                        // Finaliser la réservation (déduire les places)
                        $this->handlePaypalPaymentSuccess($paiement, $capture);

                        Log::info("✅ Paiement $paypalId capturé automatiquement pour $amount");
                    } else {
                        Log::warning("Paiement $paypalId non capturé : " . json_encode($capture));
                    }
                } catch (\Exception $e) {
                    Log::error("Erreur capture PayPal pour $paypalId : " . $e->getMessage());
                }

                break;

            case 'PAYMENT.CAPTURE.COMPLETED':
                $amount = $payload['resource']['amount']['value'] ?? null;
                $currency = $payload['resource']['amount']['currency_code'] ?? null;

                $paiement = Paiement::where('paypal_id', $paypalId)->first();
                if ($paiement) {
                    $paiement->update([
                        'status' => 'paid',
                        'total' => $amount,
                        'updated_at' => now(),
                    ]);

                    // Finaliser la réservation (déduire les places)
                    $this->handlePaypalPaymentSuccess($paiement, $payload);
                }

                Log::info("Paiement $paypalId payé : $amount $currency");
                break;
            default:
                Log::warning("Événement PayPal non géré : $event");
                break;
        }

        return;
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
