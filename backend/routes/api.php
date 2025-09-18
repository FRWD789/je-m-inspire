<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
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
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/login', [AuthController::class, 'login']);
// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/events', [EventController::class, 'index'])->name('events.index');      // lister tous
//     Route::get('/event/{id}', [EventController::class, 'show'])->name('events.show');    // détail
//     Route::post('/event', [EventController::class, 'store'])->name('events.store');      // créer
//     Route::put('/event/{id}', [EventController::class, 'update'])->name('events.update');// modifier
// });
