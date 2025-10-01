<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AbonnementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\VendorEarningsController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Événements publics
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Rôles (pour le formulaire d'inscription)
Route::get('/roles', [RoleController::class, 'index']);

// Webhooks (sans authentification)
Route::post('/stripe/webhook', [PaiementController::class, 'stripeWebhook']);
Route::post('/paypal/webhook', [PaiementController::class, 'paypalWebhook']);
Route::post('/abonnementPaypal/webhook', [AbonnementController::class, 'abonnementPaypalWebhook']);

// Statut de paiement (accessible sans auth pour les redirections)
Route::get('/payment/status', [PaiementController::class, 'getPaymentStatus']);

// Routes protégées par JWT
Route::middleware(['jwt.auth'])->group(function () {
    // ==========================================
    // AUTHENTIFICATION
    // ==========================================
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);

    // ==========================================
    // ÉVÉNEMENTS
    // ==========================================
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/my-events', [EventController::class, 'myEvents']);

    // ==========================================
    // RÉSERVATIONS
    // ==========================================
    Route::post('/events/{id}/reserve', [EventController::class, 'reserve']);
    Route::delete('/events/{id}/reservation', [EventController::class, 'cancelReservation']);
    Route::get('/mes-reservations', [OperationController::class, 'mesReservations']);
    Route::delete('/reservations/{id}', [OperationController::class, 'destroy']);

    // ==========================================
    // PAIEMENTS
    // ==========================================
    Route::post('/stripe/checkout', [PaiementController::class, 'stripeCheckout']);
    Route::post('/paypal/checkout', [PaiementController::class, 'paypalCheckout']);

    // ==========================================
    // ✅ COMPTES LIÉS (STRIPE & PAYPAL)
    // ==========================================

    // Récupérer le statut des comptes liés
    Route::get('/profile/linked-accounts', [ProfileController::class, 'getLinkedAccounts']);

    // STRIPE - Liaison OAuth
    Route::get('/profile/stripe/link', [ProfileController::class, 'linkStripeAccount']);
    Route::get('/profile/stripe/success', [ProfileController::class, 'linkStripeSuccess']);
    Route::get('/profile/stripe/callback', [ProfileController::class, 'linkStripeSuccess']); // Alias pour compatibilité
    Route::delete('/profile/stripe/unlink', [ProfileController::class, 'unlinkStripeAccount']);

    // PAYPAL - Liaison OAuth
    Route::get('/profile/paypal/link', [ProfileController::class, 'linkPaypalAccount']);
    Route::get('/profile/paypal/success', [ProfileController::class, 'linkPaypalSuccess']);
    Route::get('/profile/paypal/callback', [ProfileController::class, 'linkPaypalSuccess']); // Alias pour compatibilité
    Route::delete('/profile/paypal/unlink', [ProfileController::class, 'unlinkPaypalAccount']);

    // ⚠️ ANCIENNES ROUTES (à supprimer après migration du frontend)
    Route::post('/link/stripe', [ProfileController::class, 'linkStripeAccount']); // Deprecated
    Route::post('/link/paypal', [ProfileController::class, 'linkPaypalAccount']); // Deprecated
    Route::post('/unlink-stripe', [ProfileController::class, 'unlinkStripeAccount']); // Deprecated
    Route::post('/unlink-paypal', [ProfileController::class, 'unlinkPaypalAccount']); // Deprecated
});

// ==========================================
// ABONNEMENTS PRO PLUS
// ==========================================
Route::middleware('auth.jwt')->prefix('/abonnement')->group(function () {
    Route::post('/stripe', [AbonnementController::class, 'abonnementStripe']);
    Route::post('/paypal', [AbonnementController::class, 'abonnementPaypal']);
    Route::post('/cancel', [AbonnementController::class, 'cancelAbonnement']);
    Route::get('/info', [AbonnementController::class, 'getAbonnementInfo']);
    Route::get('/status', [AbonnementController::class, 'checkSubscriptionStatus']);
});

// Pages de succès/annulation pour abonnements
Route::get('/abonnement/success', function() {
    return redirect(env('FRONTEND_URL') . '/abonnement/success');
});

Route::get('/abonnement/cancel', function() {
    return redirect(env('FRONTEND_URL') . '/abonnement/cancel');
});

Route::get('/abonnement/paypal/success', function() {
    return redirect(env('FRONTEND_URL') . '/abonnement/success?provider=paypal');
});

// ==========================================
// ADMIN - GESTION DES COMMISSIONS
// ==========================================
Route::middleware(['auth.jwt', 'admin'])->prefix('/admin')->group(function () {
    Route::get('/commissions', [CommissionController::class, 'index']);
    Route::get('/commissions/statistics', [CommissionController::class, 'statistics']);
    Route::put('/commissions/{id}', [CommissionController::class, 'update']);
    Route::post('/commissions/bulk-update', [CommissionController::class, 'bulkUpdate']);
});

// ==========================================
// VENDEUR - REVENUS ET COMMISSIONS
// ==========================================
Route::middleware(['auth.jwt', 'professional'])->prefix('/vendor')->group(function () {
    Route::get('/earnings', [VendorEarningsController::class, 'index']);
    Route::get('/earnings/statistics', [VendorEarningsController::class, 'statistics']);
    Route::get('/earnings/export', [VendorEarningsController::class, 'export']);
});
