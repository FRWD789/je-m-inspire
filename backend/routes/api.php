<?php

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return new UserResource($request->user());  //le mdp et token ne sont pas envoyé (voir resource)
})->middleware('auth:sanctum');
