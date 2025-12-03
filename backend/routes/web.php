<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

// ✅ Route pour servir les fichiers storage avec CORS
Route::get('/storage/{path}', function ($path) {
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }

    return Response::file(
        Storage::disk('public')->path($path),
        [
            'Content-Type' => Storage::disk('public')->mimeType($path),
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]
    );
})->where('path', '.*');
