<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheImagesMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Vérifier si c'est une requête d'image
        if ($this->isImageRequest($request)) {
            // Cache pendant 1 an (immutable = ne change jamais)
            $response->header('Cache-Control', 'public, max-age=31536000, immutable');

            // ETag pour validation conditionnelle
            $etag = md5($response->getContent());
            $response->setEtag($etag);

            // Si le client a déjà cette version → 304 Not Modified
            if ($request->header('If-None-Match') === $etag) {
                $response->setStatusCode(304);
                $response->setContent('');
            }
        }

        return $response;
    }

    private function isImageRequest(Request $request): bool
    {
        $path = $request->path();

        if (str_starts_with($path, 'storage/')) {
            $extension = pathinfo($path, PATHINFO_EXTENSION);
            return in_array(strtolower($extension), [
                'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'
            ]);
        }

        return false;
    }
}
