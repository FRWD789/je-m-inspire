<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tymon\JWTAuth\Facades\JWTAuth;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Test routes
Route::get('/test-simple', function() {
    return response()->json(['message' => 'Simple test works']);
});

// Protected routes
Route::middleware('auth.jwt')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Events routes - matching frontend expectations
    Route::get('/events', [EventController::class, 'index'])->name('events.index');        // GET /api/events
    Route::post('/events', [EventController::class, 'store'])->name('events.store');       // POST /api/events
    Route::get('/events/{id}', [EventController::class, 'show'])->name('events.show');     // GET /api/events/{id}
    Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update'); // PUT /api/events/{id}
    Route::delete('/events/{id}', [EventController::class, 'delete'])->name('events.delete'); // DELETE /api/events/{id}

    Route::get('/test-auth', function() {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            return response()->json(['message' => 'Auth works', 'user_id' => $user->id]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});
