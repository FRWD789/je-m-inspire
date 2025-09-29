<?php
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AbonnementController;
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

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/refresh', [AuthController::class, 'refresh']);

// Webhooks (sans authentification, vérifiés par signature)
Route::post('/webhooks/stripe', [AbonnementController::class, 'abonnementStripeWebhook']);
Route::post('/webhooks/paypal', [AbonnementController::class, 'abonnementPaypalWebhook']);

// Routes protégées
Route::middleware('auth.jwt')->group(function () {
    // Événements
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::get('/event/{id}', [EventController::class, 'show'])->name('events.show');
    Route::post('/event', [EventController::class, 'store'])->name('events.store');
    Route::put('/event/{id}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/event/{id}', [EventController::class, 'destroy'])->name('events.destroy');

    // Routes d'abonnement Pro Plus (professionnels uniquement)
    Route::prefix('abonnement')->group(function () {
        Route::post('/stripe', [AbonnementController::class, 'abonnementStripe']);
        Route::post('/paypal', [AbonnementController::class, 'abonnementPaypal']);
        Route::post('/cancel', [AbonnementController::class, 'cancelAbonnement']);
        Route::get('/info', [AbonnementController::class, 'getAbonnementInfo']);
    });
});

// Email verification
Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);
    if (!URL::hasValidSignature($request)) {
        return response()->json(['message' => 'Invalid or expired link'], 400);
    }
    if (!hash_equals(sha1($user->email), $hash)) {
        return response()->json(['message' => 'Invalid verification link'], 400);
    }
    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified']);
    }
    $user->markEmailAsVerified();
    event(new Verified($user));
    return response()->json(['message' => 'Email verified successfully!']);
})->name('verification.verify');

// Password reset
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
            $user->forceFill(['password' => Hash::make($password)])->save();
        }
    );
    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => __($status)], 200)
        : response()->json(['message' => __($status)], 400);
})->name('password.reset');
