<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\RoleController;

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

// Statut de paiement (accessible sans auth pour les redirections)
Route::get('/payment/status', [PaiementController::class, 'getPaymentStatus']);

// Routes protégées par JWT
Route::middleware(['jwt.auth'])->group(function () {
    // Authentification
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Événements (gestion) - SANS DOUBLONS
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/my-events', [EventController::class, 'myEvents']);

    // Réservations - AJOUTER CETTE ROUTE MANQUANTE
    Route::post('/events/{id}/reserve', [EventController::class, 'reserve']);
    Route::delete('/events/{id}/reservation', [EventController::class, 'cancelReservation']);

    Route::get('/mes-reservations', [OperationController::class, 'mesReservations']);
    Route::delete('/reservations/{id}', [OperationController::class, 'destroy']);

    // Paiements
    Route::post('/stripe/checkout', [PaiementController::class, 'stripeCheckout']);
    Route::post('/paypal/checkout', [PaiementController::class, 'paypalCheckout']);
});
