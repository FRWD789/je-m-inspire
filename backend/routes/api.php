<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\TypeOperationController;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
Route::get('/', function () {
    return response()->json(['message' => 'Hello world!']);
})->middleware('auth.jwt');

Route::post('/refresh', [AuthController::class, 'refresh']);
// Route::get('/user', function (Request $request) {
//     return new UserResource($request->user());  //le mdp et token ne sont pas envoyé (voir resource)
// })->middleware('auth:sanctum');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


use App\Http\Controllers\RoleController;

// Routes publiques pour les rôles (lecture seule)
Route::get('/roles', [RoleController::class, 'index']); // Liste tous les rôles
Route::get('/roles/{id}', [RoleController::class, 'show']); // Détail d'un rôle

// Routes protégées pour la gestion des rôles (admin uniquement)
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::post('/roles', [RoleController::class, 'store']); // Créer un rôle
    Route::put('/roles/{id}', [RoleController::class, 'update']); // Modifier un rôle
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']); // Supprimer un rôle
});
Route::middleware(['auth:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']); // Ajoute cette ligne
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Routes publiques - Consulter les événements
Route::get('/events', [EventController::class, 'index']);

// Routes protégées
Route::middleware('auth:api')->group(function () {
    // Route spécifique AVANT les routes avec paramètres
    Route::get('/events/my', [EventController::class, 'myEvents']);
    Route::get('/events/mesReservations', [OperationController::class, 'mesReservations']);


    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // Opérations
    Route::post('/operations', [OperationController::class, 'store']);
    Route::get('/operations', [OperationController::class, 'index']);
    Route::get('/operations/{id}', [OperationController::class, 'show']);
    Route::delete('/operations/{id}', [OperationController::class, 'destroy']);

});

// Types d'opérations
Route::get('/type-operations', [TypeOperationController::class, 'index']);
