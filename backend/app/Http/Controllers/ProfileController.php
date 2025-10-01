<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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

    public function linkStripeAccount()
    {
        // URL d’autorisation Stripe OAuth (Standard)
        $url = "https://connect.stripe.com/oauth/authorize?response_type=code"
            . "&client_id=" . env('STRIPE_OAUTH_ID')   // depuis dashboard Stripe
            . "&scope=read_write"
            . "&redirect_uri=" . "http://localhost:5173/profile/stripe/success"; // callback côté Laravel

        return response()->json([
            'success' => true,
            'url' => $url
        ]);
    }

    public function linkPaypalAccount()
    {
        $clientId = env('PAYPAL_SANDBOX_CLIENT_ID');
        $redirectUri = "http://localhost:5173/profile/paypal/success";

        $url = "https://www.sandbox.paypal.com/connect/?flowEntry=static&client_id={$clientId}&response_type=code&scope=openid https://uri.paypal.com/services/paypalattributes email https://uri.paypal.com/services/paypalattributes&redirect_uri={$redirectUri}";

        return response()->json([
            'success' => true,
            'url' => $url
        ]);
    }

     public function linkStripeSuccess(Request $request)
    {
        $code = $request->get('code');

        if (!$code) {
            return response()->json([
                'success' => false,
                'message' => 'Code Stripe manquant'
            ], 400);
        }

        $stripe = new \Stripe\StripeClient(env('STRIPE_SECRET'));

        try {
            $response = $stripe->oauth->token([
                'grant_type' => 'authorization_code',
                'code' => $code,
            ]);

            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $user->stripeAccount_id = $response->stripe_user_id;
            $user->save();

            Log::info('Compte Stripe lié avec succès', [
                'user_id' => $user->id,
                'stripeAccount_id' => $response->stripe_user_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte Stripe lié avec succès !',
                'stripeAccount_id' => $response->stripe_user_id
            ]);

        } catch (\Exception $e) {
            Log::error('[Stripe] Erreur OAuth : ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Impossible de lier le compte Stripe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Callback PayPal OAuth - Finaliser la liaison
     */
    public function linkPaypalSuccess(Request $request)
    {
        $code = $request->get('code');
        Log::info('[PayPal] Code reçu : ' . ($code ?? 'null'));

        if (!$code) {
            Log::error('[PayPal] Aucun code reçu');

            return response()->json([
                'success' => false,
                'message' => 'Code PayPal manquant'
            ], 400);
        }

        $user = auth()->user();

        if (!$user) {
            Log::error('[PayPal] Aucun utilisateur connecté');

            return response()->json([
                'success' => false,
                'message' => 'Vous devez être connecté pour lier PayPal'
            ], 401);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode(env('PAYPAL_SANDBOX_CLIENT_ID') . ':' . env('PAYPAL_SANDBOX_CLIENT_SECRET')),
                'Content-Type'  => 'application/x-www-form-urlencoded',
            ])->asForm()->post('https://api.sandbox.paypal.com/v1/identity/openidconnect/tokenservice', [
                'grant_type'   => 'authorization_code',
                'code'         => $code,
                'redirect_uri' => env('FRONTEND_URL') . '/profile/paypal/success',
            ]);

            Log::info('[PayPal] Réponse tokenservice : ' . $response->body());

            $data = $response->json();
            $accessToken = $data['access_token'] ?? null;
            Log::info('[PayPal] Access token : ' . ($accessToken ?? 'null'));

            if (!$accessToken) {
                Log::error('[PayPal] Impossible de récupérer l\'access token', $data);

                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de récupérer l\'access token',
                    'details' => $data
                ], 400);
            }

            // Récupération des infos du compte PayPal
            $userInfoResponse = Http::withHeaders([
                'Authorization' => "Bearer $accessToken",
            ])->get('https://api.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1');

            Log::info('[PayPal] Réponse userinfo : ' . $userInfoResponse->body());
            $userInfo = $userInfoResponse->json();

            // Lier le compte PayPal à l'utilisateur
            $user->paypalEmail = $userInfo['emails'][0]['value'] ?? null;
            $user->paypalAccount_id = $userInfo['payer_id'] ?? null;
            $user->save();

            Log::info('[PayPal] Compte lié pour user_id=' . $user->id . ' avec payer_id=' . ($user->paypal_merchant_id ?? 'null'));

            return response()->json([
                'success' => true,
                'message' => 'Compte PayPal lié avec succès !',
                'paypal_email' => $user->paypalEmail,
                'payer_id' => $user->paypalAccount_id
            ]);

        } catch (\Exception $e) {
            Log::error('[PayPal] Exception lors de la liaison : ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la liaison du compte PayPal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Délier le compte Stripe - Supprime les informations en BD
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

            if (!$user->stripe_account_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun compte Stripe lié'
                ], 404);
            }

            // Sauvegarder l'ID avant suppression pour les logs
            $stripeAccountId = $user->stripe_account_id;

            // Supprimer les informations Stripe de la BD
            $user->stripe_account_id = null;
            $user->save();

            Log::info('Compte Stripe délié', [
                'user_id' => $user->id,
                'stripe_account_id' => $stripeAccountId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte Stripe délié avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur déliaison Stripe', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déliaison du compte Stripe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Délier le compte PayPal - Supprime les informations en BD
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

            if (!$user->paypal_merchant_id && !$user->paypal_email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun compte PayPal lié'
                ], 404);
            }

            // Sauvegarder les infos avant suppression pour les logs
            $paypalMerchantId = $user->paypal_merchant_id;
            $paypalEmail = $user->paypal_email;

            // Supprimer les informations PayPal de la BD
            $user->paypal_merchant_id = null;
            $user->paypal_email = null;
            $user->save();

            Log::info('Compte PayPal délié', [
                'user_id' => $user->id,
                'paypal_merchant_id' => $paypalMerchantId,
                'paypal_email' => $paypalEmail
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte PayPal délié avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur déliaison PayPal', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déliaison du compte PayPal',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
