<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;

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
            . "&redirect_uri=" . urlencode(route('linkStripeSuccess')); // callback côté Laravel

        return response()->json([
            'success' => true,
            'url' => $url
        ]);
    }

    public function linkPaypalAccount()
    {
        $clientId = env('PAYPAL_SANDBOX_CLIENT_ID');
        $redirectUri = "https://allo.loca.lt/user/linkPaypal/success";

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
            return redirect()->route('profile.edit')->with('error', 'Code Stripe manquant');
        }

        $stripe = new \Stripe\StripeClient(env('STRIPE_SECRET'));

        try {
            $response = $stripe->oauth->token([
                'grant_type' => 'authorization_code',
                'code' => $code,
            ]);

            $user = auth()->user();
            $user->stripeAccount_id = $response->stripe_user_id; // ✅ ID du compte vendeur
            $user->save();

            return redirect()->route('profile.edit')->with('success', 'Compte Stripe lié avec succès !');
        } catch (\Exception $e) {
            \Log::error('[Stripe] Erreur OAuth : ' . $e->getMessage());
            return redirect()->route('profile.edit')->with('error', 'Impossible de lier le compte Stripe');
        }
    }

     public function linkPaypalSuccess(Request $request)
    {
        $code = $request->get('code'); // code reçu depuis PayPal
        Log::info('[PayPal] Code reçu : ' . ($code ?? 'null'));

        if (!$code) {
            Log::error('[PayPal] Aucun code reçu');
            return redirect()->route('profile.edit')->with('error', 'Code PayPal manquant');
        }

        // Vérifie que l'utilisateur est connecté
        $user = auth()->user();
        if (!$user) {
            Log::error('[PayPal] Aucun utilisateur connecté');
            return redirect()->route('login')->with('error', 'Vous devez être connecté pour lier PayPal');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode(env('PAYPAL_SANDBOX_CLIENT_ID') . ':' . env('PAYPAL_SANDBOX_CLIENT_SECRET')),
                'Content-Type'  => 'application/x-www-form-urlencoded',
            ])->asForm()->post('https://api.sandbox.paypal.com/v1/identity/openidconnect/tokenservice', [
                'grant_type'   => 'authorization_code',
                'code'         => $code,
                'redirect_uri' => 'https://allo.loca.lt/user/linkPaypal/success', // identique à l'URL de redirection
            ]);

            Log::info('[PayPal] Réponse tokenservice : ' . $response->body());

            $data = $response->json();
            $accessToken = $data['access_token'] ?? null;
            Log::info('[PayPal] Access token : ' . ($accessToken ?? 'null'));

            if (!$accessToken) {
                Log::error('[PayPal] Impossible de récupérer l\'access token', $data);
                return redirect()->route('profile.edit')->with('error', 'Impossible de récupérer l\'access token');
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

            Log::info('[PayPal] Compte lié pour user_id=' . $user->id . ' avec payer_id=' . ($user->paypalAccount_id ?? 'null'));

            return redirect()->route('profile.edit')->with('success', 'Compte PayPal lié avec succès !');

        } catch (\Exception $e) {
            Log::error('[PayPal] Exception lors de la liaison : ' . $e->getMessage());
            return redirect()->route('profile.edit')->with('error', 'Erreur lors de la liaison du compte PayPal');
        }
    }
}
