<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Event;
use App\Models\Operation;
use App\Models\Paiement;
use App\Models\Abonnement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        return view('profile.edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Initier la liaison Stripe OAuth
     */
    public function linkStripeAccount()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }

            // ✅ Créer un state sécurisé
            $state = base64_encode(json_encode([
                'user_id' => $user->id,
                'timestamp' => now()->timestamp
            ]));

            // Stocker le state en cache (expire dans 10 minutes)
            Cache::put("stripe_oauth_state_{$state}", $user->id, 600);

            // URL d'autorisation Stripe OAuth
            $url = "https://connect.stripe.com/oauth/authorize?response_type=code"
                . "&client_id=" . env('STRIPE_OAUTH_ID')
                . "&scope=read_write"
                . "&state=" . urlencode($state)
                . "&redirect_uri=" . env('PUBLIC_FRONTEND_URL') . '/profile/stripe/success';

            Log::info('[Stripe] OAuth initié', [
                'user_id' => $user->id,
                'state' => substr($state, 0, 20) . '...'
            ]);

            return response()->json([
                'success' => true,
                'url' => $url
            ]);

        } catch (\Exception $e) {
            Log::error('[Stripe] Erreur initiation OAuth', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation de la liaison Stripe'
            ], 500);
        }
    }

    /**
     * Initier la liaison PayPal OAuth
     */
    public function linkPaypalAccount()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }

            $clientId = env('PAYPAL_SANDBOX_CLIENT_ID');
            $redirectUri = env('PUBLIC_FRONTEND_URL') . '/profile/paypal/success';

            $url = "https://www.sandbox.paypal.com/connect/?flowEntry=static"
                . "&client_id={$clientId}"
                . "&response_type=code"
                . "&scope=openid email https://uri.paypal.com/services/paypalattributes"
                . "&redirect_uri=" . urlencode($redirectUri);

            Log::info('[PayPal] OAuth initié', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'url' => $url
            ]);

        } catch (\Exception $e) {
            Log::error('[PayPal] Erreur initiation OAuth', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation de la liaison PayPal'
            ], 500);
        }
    }

    /**
     * Callback Stripe OAuth - Finaliser la liaison
     */
    public function linkStripeSuccess(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');

            if (!$code) {
                return response()->json([
                    'success' => false,
                    'message' => 'Code d\'autorisation manquant'
                ], 400);
            }

            // ✅ PROTECTION : Vérifier si ce code a déjà été traité
            $cacheKey = "stripe_oauth_code_{$code}";

            if (Cache::has($cacheKey)) {
                Log::warning('[Stripe] Code OAuth déjà utilisé', [
                    'code' => substr($code, 0, 10) . '...'
                ]);

                $cachedResult = Cache::get($cacheKey);
                return response()->json($cachedResult);
            }

            // ✅ Valider le state
            if ($state) {
                $stateCacheKey = "stripe_oauth_state_{$state}";
                $userId = Cache::get($stateCacheKey);

                if (!$userId) {
                    Log::error('[Stripe] State invalide ou expiré', [
                        'state' => substr($state, 0, 20) . '...'
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'State invalide ou expiré. Veuillez réessayer.'
                    ], 400);
                }

                // Supprimer le state (usage unique)
                Cache::forget($stateCacheKey);

                $user = User::find($userId);
            } else {
                // Fallback si pas de state (rétrocompatibilité)
                $user = Auth::user();
            }

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Échanger le code contre un access token
            Stripe::setApiKey(config('services.stripe.secret'));

            $response = \Stripe\OAuth::token([
                'grant_type' => 'authorization_code',
                'code' => $code,
            ]);

            $stripeUserId = $response->stripe_user_id;

            // Sauvegarder l'ID du compte Stripe
            $user->stripeAccount_id = $stripeUserId;
            $user->save();

            $result = [
                'success' => true,
                'message' => 'Compte Stripe lié avec succès',
                'stripe_user_id' => $stripeUserId
            ];

            // ✅ Mettre en cache (10 minutes)
            Cache::put($cacheKey, $result, 600);

            Log::info('[Stripe] Compte lié avec succès', [
                'user_id' => $user->id,
                'stripeAccount_id' => $stripeUserId
            ]);

            return response()->json($result);

        } catch (\Stripe\Exception\OAuth\OAuthErrorException $e) {
            Log::error('[Stripe] Erreur OAuth : ' . $e->getMessage());

            // ✅ Si code déjà utilisé, retourner succès
            if (str_contains($e->getMessage(), 'already been used')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Compte déjà lié précédemment',
                    'already_processed' => true
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);

        } catch (\Exception $e) {
            Log::error('[Stripe] Erreur callback OAuth', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la liaison : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Callback PayPal OAuth - Finaliser la liaison
     */
    public function linkPaypalSuccess(Request $request)
    {
        try {
            $code = $request->get('code');

            Log::info('[PayPal] Callback reçu', [
                'code' => $code ? substr($code, 0, 10) . '...' : 'null'
            ]);

            if (!$code) {
                Log::error('[PayPal] Code manquant');
                return response()->json([
                    'success' => false,
                    'message' => 'Code PayPal manquant'
                ], 400);
            }

            // ✅ PROTECTION : Vérifier si ce code a déjà été traité
            $cacheKey = "paypal_oauth_code_{$code}";

            if (Cache::has($cacheKey)) {
                Log::warning('[PayPal] Code OAuth déjà utilisé');
                $cachedResult = Cache::get($cacheKey);
                return response()->json($cachedResult);
            }

            $user = auth()->user();

            if (!$user) {
                Log::error('[PayPal] Utilisateur non connecté');
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté pour lier PayPal'
                ], 401);
            }

            // Échanger le code contre un access token
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode(
                    env('PAYPAL_SANDBOX_CLIENT_ID') . ':' . env('PAYPAL_SANDBOX_CLIENT_SECRET')
                ),
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])->asForm()->post('https://api.sandbox.paypal.com/v1/identity/openidconnect/tokenservice', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => 'http://192.168.1.72:5173/profile/paypal/success',
            ]);

            Log::info('[PayPal] Réponse token', [
                'status' => $response->status()
            ]);

            $data = $response->json();
            $accessToken = $data['access_token'] ?? null;

            if (!$accessToken) {
                Log::error('[PayPal] Access token manquant', $data);
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de récupérer l\'access token',
                    'details' => $data
                ], 400);
            }

            // Récupérer les infos du compte PayPal
            $userInfoResponse = Http::withHeaders([
                'Authorization' => "Bearer $accessToken",
            ])->get('https://api.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1');

            Log::info('[PayPal] Réponse userinfo', [
                'status' => $userInfoResponse->status()
            ]);

            $userInfo = $userInfoResponse->json();

            // Sauvegarder les informations PayPal
            $user->paypalEmail = $userInfo['emails'][0]['value'] ?? null;
            $user->paypalAccount_id = $userInfo['payer_id'] ?? null;
            $user->save();

            $result = [
                'success' => true,
                'message' => 'Compte PayPal lié avec succès !',
                'paypal_email' => $user->paypalEmail,
                'payer_id' => $user->paypalAccount_id
            ];

            // ✅ Mettre en cache (10 minutes)
            Cache::put($cacheKey, $result, 600);

            Log::info('[PayPal] Compte lié avec succès', [
                'user_id' => $user->id,
                'payer_id' => $user->paypalAccount_id
            ]);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('[PayPal] Exception callback', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la liaison du compte PayPal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   public function getLinkedAccounts(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'stripe' => [
                    'linked' => !empty($user->stripeAccount_id),
                    'account_id' => $user->stripeAccount_id,
                ],
                'paypal' => [
                    'linked' => !empty($user->paypalAccount_id),
                    'account_id' => $user->paypalAccount_id,
                    'email' => $user->paypalEmail,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('[Profile] Erreur récupération comptes liés', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des comptes liés'
            ], 500);
        }
    }

    /**
     * Délier le compte Stripe
     */
    public function unlinkStripeAccount(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if (!$user->stripeAccount_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun compte Stripe lié'
                ], 404);
            }

            $stripeAccountId = $user->stripeAccount_id;

            // Supprimer les informations Stripe
            $user->stripeAccount_id = null;
            $user->save();

            Log::info('[Stripe] Compte délié', [
                'user_id' => $user->id,
                'stripe_account_id' => $stripeAccountId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte Stripe délié avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('[Stripe] Erreur déliaison', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déliaison du compte Stripe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Délier le compte PayPal
     */
    public function unlinkPaypalAccount(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if (!$user->paypalAccount_id && !$user->paypalEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun compte PayPal lié'
                ], 404);
            }

            // Supprimer les informations PayPal
            $user->paypalAccount_id = null;
            $user->paypalEmail = null;
            $user->save();

            Log::info('[PayPal] Compte délié', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte PayPal délié avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('[PayPal] Erreur déliaison', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déliaison du compte PayPal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

     public function deleteAccount(Request $request)
    {
        try {
            $request->validate([
                'password' => 'required|string',
                'confirmation' => 'required|string|in:SUPPRIMER'
            ]);

            $user = auth()->user();

            // Vérifier le mot de passe
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mot de passe incorrect'
                ], 401);
            }

            DB::beginTransaction();

            Log::info('=== DÉBUT SUPPRESSION COMPTE ===', ['user_id' => $user->id]);

            // ====================================================================
            // 1. SUPPRIMER LES ÉVÉNEMENTS CRÉÉS PAR L'UTILISATEUR
            // ====================================================================
            $createdEvents = Operation::where('user_id', $user->id)
                ->where('type_operation_id', 1) // Type "création"
                ->pluck('event_id')
                ->unique();

            foreach ($createdEvents as $eventId) {
                $event = Event::find($eventId);
                if ($event) {
                    Log::info('Suppression événement créé', [
                        'event_id' => $event->id,
                        'event_name' => $event->name
                    ]);

                    // Cela supprimera aussi toutes les operations liées à cet event (cascade)
                    $event->delete();
                }
            }

            // ====================================================================
            // 2. SUPPRIMER LES PAIEMENTS DE L'UTILISATEUR
            // ====================================================================
            // Récupérer tous les paiement_id des opérations de l'utilisateur
            $paiementIds = Operation::where('user_id', $user->id)
                ->whereNotNull('paiement_id')
                ->pluck('paiement_id')
                ->unique();

            foreach ($paiementIds as $paiementId) {
                $paiement = Paiement::where('paiement_id', $paiementId)->first();
                if ($paiement) {
                    Log::info('Suppression paiement', [
                        'paiement_id' => $paiement->paiement_id,
                        'status' => $paiement->status,
                        'total' => $paiement->total
                    ]);
                    $paiement->delete();
                }
            }

            // ====================================================================
            // 3. ANNULER ET SUPPRIMER LES ABONNEMENTS
            // ====================================================================
            $abonnementIds = Operation::where('user_id', $user->id)
                ->whereNotNull('abonnement_id')
                ->pluck('abonnement_id')
                ->unique();

            foreach ($abonnementIds as $abonnementId) {
                $abonnement = Abonnement::where('abonnement_id', $abonnementId)->first();

                if ($abonnement && $abonnement->status === 'active') {
                    try {
                        // Annuler sur Stripe
                        if ($abonnement->stripe_subscription_id) {
                            Stripe::setApiKey(env('STRIPE_SECRET'));
                            \Stripe\Subscription::update($abonnement->stripe_subscription_id, [
                                'cancel_at_period_end' => false
                            ]);
                            \Stripe\Subscription::retrieve($abonnement->stripe_subscription_id)->cancel();

                            Log::info('Abonnement Stripe annulé', [
                                'subscription_id' => $abonnement->stripe_subscription_id
                            ]);
                        }

                        // Annuler sur PayPal
                        if ($abonnement->paypal_subscription_id) {
                            $response = Http::withBasicAuth(
                                env('PAYPAL_CLIENT_ID'),
                                env('PAYPAL_SECRET')
                            )->post(
                                env('PAYPAL_API_URL') . "/v1/billing/subscriptions/{$abonnement->paypal_subscription_id}/cancel",
                                ['reason' => 'Account deletion']
                            );

                            Log::info('Abonnement PayPal annulé', [
                                'subscription_id' => $abonnement->paypal_subscription_id
                            ]);
                        }

                        $abonnement->update(['status' => 'cancelled']);
                    } catch (\Exception $e) {
                        Log::error('Erreur annulation abonnement', [
                            'abonnement_id' => $abonnement->abonnement_id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                // Supprimer l'abonnement
                if ($abonnement) {
                    Log::info('Suppression abonnement', [
                        'abonnement_id' => $abonnement->abonnement_id
                    ]);
                    $abonnement->delete();
                }
            }

            // ====================================================================
            // 4. SUPPRIMER L'UTILISATEUR
            // ====================================================================
            // Cela supprimera automatiquement (cascade) :
            // - operations (FK user_id)
            // - remboursements (FK user_id)
            // - role_user (FK user_id)

            $userId = $user->id;
            $userEmail = $user->email;

            $user->delete();

            Log::info('=== COMPTE SUPPRIMÉ AVEC SUCCÈS ===', [
                'user_id' => $userId,
                'email' => $userEmail
            ]);

            DB::commit();

            // Déconnecter l'utilisateur
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => true,
                'message' => 'Votre compte a été supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('=== ERREUR SUPPRESSION COMPTE ===', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du compte',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
