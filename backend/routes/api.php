<?php
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\RoleController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Resources\UserResource;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Mockery\Generator\StringManipulation\Pass\Pass;

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
        ? response()->json(['message' => __($status)], 200)
        : response()->json(['message' => __($status)], 400);
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
        ? response()->json(['message' => __($status)], 200)
        : response()->json(['message' => __($status)], 400);
})->name('password.reset');;

Route::get('/user', function () {
    return response()->json(['message' => 'Hello world!']);
})->middleware('auth.jwt');
Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (! URL::hasValidSignature($request)) {
        return response()->json(['message' => 'Invalid or expired link'], 400);
    }

    if (! hash_equals(sha1($user->email), $hash)) {
        return response()->json(['message' => 'Invalid verification link'], 400);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified']);
    }

    $user->markEmailAsVerified();
    event(new Verified($user));

    return response()->json(['message' => 'Email verified successfully!']);
})->name('verification.verify');
Route::get('/refresh', [AuthController::class, 'refresh']);
// Route::get('/user', function (Request $request) {
//     return new UserResource($request->user());  //le mdp et token ne sont pas envoyé (voir resource)
// })->middleware('auth:sanctum');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
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
