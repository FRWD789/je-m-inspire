<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\RemboursementController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AbonnementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\VendorEarningsController;

//route auth maher
Route::get('/test-mail', function() {
    try {
        Mail::raw('Hello from Laravel', function($message) {
            $message->to('test@example.com')
                    ->subject('Test Mail');
        });

        return response()->json(['message' => 'Test email sent successfully!']);
    } catch (\Exception $e) {
        // Catch any exception and return the error message for debugging
        return response()->json([
            'message' => 'Failed to send test email',
            'error' => $e->getMessage(),
        ], 500);
    }
});


Route::post('/forgot-password', function (Request $request) {

    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink($request->only('email'));

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => ($status)], 200)
        : response()->json(['message' => ($status)], 400);
});


Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->save();
        }
    );

    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => ($status)], 200)
        : response()->json(['message' => ($status)], 400);
})->name('password.reset');;

// ==========================================
// ROUTES PUBLIQUES
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Événements publics
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Rôles
Route::get('/roles', [RoleController::class, 'index']);

// Statut de paiement
Route::get('/payment/status', [PaiementController::class, 'getPaymentStatus']);

// ==========================================
// WEBHOOKS
// ==========================================
Route::post('/stripe/webhook', [PaiementController::class, 'stripeWebhook']);
Route::post('/paypal/webhook', [PaiementController::class, 'paypalWebhook']);
Route::post('/abonnementPaypal/webhook', [AbonnementController::class, 'abonnementPaypalWebhook']);

// ==========================================
// ROUTES PROTÉGÉES - UTILISEZ LE MIDDLEWARE QUI EXISTE CHEZ VOUS
// Remplacez 'auth:api' par 'jwt.auth' ou 'auth.jwt' selon votre config
// ==========================================
Route::middleware(['auth:api'])->group(function () {

    // AUTHENTIFICATION & PROFIL
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);

    // ÉVÉNEMENTS
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/my-events', [EventController::class, 'myEvents']);

    // RÉSERVATIONS
    Route::post('/events/{id}/reserve', [EventController::class, 'reserve']);
    Route::delete('/events/{id}/reservation', [EventController::class, 'cancelReservation']);
    Route::get('/mes-reservations', [OperationController::class, 'mesReservations']);
    Route::delete('/reservations/{id}', [OperationController::class, 'destroy']);

    // PAIEMENTS
    Route::post('/stripe/checkout', [PaiementController::class, 'stripeCheckout']);
    Route::post('/paypal/checkout', [PaiementController::class, 'paypalCheckout']);

    // REMBOURSEMENTS
    Route::post('/remboursements', [RemboursementController::class, 'store']);
    Route::get('/mes-remboursements', [RemboursementController::class, 'mesDemandes']);
    Route::get('/remboursements', [RemboursementController::class, 'index']);
    Route::put('/remboursements/{id}/traiter', [RemboursementController::class, 'traiter']);

    // GESTION UTILISATEURS
    Route::get('/professionnels', [AuthController::class, 'getProfessionnels']);
    Route::get('/utilisateurs', [AuthController::class, 'getUtilisateurs']);
    Route::put('/users/{id}/toggle-status', [AuthController::class, 'toggleUserStatus']);

    // COMPTES LIÉS
    Route::get('/profile/linked-accounts', [ProfileController::class, 'getLinkedAccounts']);
    Route::get('/profile/stripe/link', [ProfileController::class, 'linkStripeAccount']);
    Route::get('/profile/stripe/success', [ProfileController::class, 'linkStripeSuccess']);
    Route::get('/profile/stripe/callback', [ProfileController::class, 'linkStripeSuccess']);
    Route::delete('/profile/stripe/unlink', [ProfileController::class, 'unlinkStripeAccount']);
    Route::get('/profile/paypal/link', [ProfileController::class, 'linkPaypalAccount']);
    Route::get('/profile/paypal/success', [ProfileController::class, 'linkPaypalSuccess']);
    Route::get('/profile/paypal/callback', [ProfileController::class, 'linkPaypalSuccess']);
    Route::delete('/profile/paypal/unlink', [ProfileController::class, 'unlinkPaypalAccount']);

    // SUPPRESSION DE COMPTE
    Route::delete('/profile/deleteAccount', [ProfileController::class, 'deleteAccount']);

    // ABONNEMENTS
    Route::prefix('abonnement')->group(function () {
        Route::post('/stripe', [AbonnementController::class, 'abonnementStripe']);
        Route::post('/paypal', [AbonnementController::class, 'abonnementPaypal']);
        Route::post('/cancel', [AbonnementController::class, 'cancelAbonnement']);
        Route::get('/info', [AbonnementController::class, 'getAbonnementInfo']);
        Route::get('/status', [AbonnementController::class, 'checkSubscriptionStatus']);
    });

    // ADMIN - COMMISSIONS
    Route::prefix('admin')->group(function () {
        Route::get('/commissions', [CommissionController::class, 'index']);
        Route::get('/commissions/statistics', [CommissionController::class, 'statistics']);
        Route::put('/commissions/{id}', [CommissionController::class, 'update']);
        Route::post('/commissions/bulk-update', [CommissionController::class, 'bulkUpdate']);
    });

    // VENDEUR - REVENUS
    Route::prefix('vendor')->group(function () {
        Route::get('/earnings', [VendorEarningsController::class, 'index']);
        Route::get('/earnings/statistics', [VendorEarningsController::class, 'statistics']);
        Route::get('/earnings/export', [VendorEarningsController::class, 'export']);
    });
});

// REDIRECTIONS
Route::get('/abonnement/success', fn() => redirect(env('FRONTEND_URL') . '/abonnement/success'));
Route::get('/abonnement/cancel', fn() => redirect(env('FRONTEND_URL') . '/abonnement/cancel'));
Route::get('/abonnement/paypal/success', fn() => redirect(env('FRONTEND_URL') . '/abonnement/success?provider=paypal'));
