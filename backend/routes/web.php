<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

// ✅ Route pour servir les fichiers storage avec CORS
Route::get('/storage/{path}', function ($path) {
    // ✅ DEBUG : Voir ce qu'on reçoit
    \Log::info('[Storage Route] Path reçu:', ['path' => $path]);

    if (!Storage::disk('public')->exists($path)) {
        \Log::error('[Storage Route] Fichier non trouvé:', [
            'path' => $path,
            'full_path' => Storage::disk('public')->path($path)
        ]);
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
