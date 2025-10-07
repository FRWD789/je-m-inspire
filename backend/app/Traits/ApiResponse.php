<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    /**
     * ✅ Réponse de succès générique
     * Les données sont fusionnées au niveau racine pour compatibilité frontend
     *
     * Exemple: successResponse(['user' => $user, 'token' => $token])
     * Résultat: { success: true, message: "...", user: {...}, token: "..." }
     */
    protected function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        // ✅ Fusionner les données au niveau racine (pas dans un wrapper "data")
        if (is_array($data)) {
            $response = array_merge($response, $data);
        } elseif ($data !== null) {
            $response = array_merge($response, ['data' => $data]);
        }

        return response()->json($response, $code);
    }

    /**
     * ✅ Réponse d'erreur standardisée
     */
    protected function errorResponse(string $message = 'Error', int $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'error' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * ✅ Réponse avec Resource unique (User, Event, etc.)
     * Les données de la resource sont fusionnées au niveau racine
     *
     * Exemple: resourceResponse(new UserResource($user))
     * Résultat: { success: true, message: "...", id: 1, name: "John", email: "..." }
     */
    protected function resourceResponse(JsonResource $resource, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            ...$resource->toArray(request()) // ✅ Fusionner au niveau racine
        ], $code);
    }

    /**
     * ✅ Réponse avec Collection de Resources
     * RETOURNE DIRECTEMENT LE TABLEAU pour compatibilité avec .map() frontend
     *
     * Exemple: collectionResponse(EventResource::collection($events))
     * Résultat: [{id: 1, name: "..."}, {id: 2, name: "..."}]
     */
    protected function collectionResponse($collection, string $message = 'Success', int $code = 200): JsonResponse
    {
        // Convertir en tableau
        if ($collection instanceof ResourceCollection) {
            $data = $collection->toArray(request());
        } elseif (is_array($collection)) {
            $data = $collection;
        } else {
            $data = $collection->toArray();
        }

        // ✅ Si la collection a une clé 'data' (ResourceCollection standard), extraire le contenu
        if (is_array($data) && isset($data['data']) && is_array($data['data'])) {
            return response()->json($data['data'], $code);
        }

        // ✅ Sinon retourner directement le tableau
        return response()->json($data, $code);
    }

    /**
     * ✅ Erreur de validation
     */
    protected function validationErrorResponse($errors, string $message = 'Validation failed'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $message,
            'errors' => $errors
        ], 422);
    }

    /**
     * ✅ 404 Not Found
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $message
        ], 404);
    }

    /**
     * ✅ 401 Unauthorized
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $message
        ], 401);
    }

    /**
     * ✅ 403 Forbidden
     */
    protected function unauthenticatedResponse(string $message = 'Unauthenticated'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $message
        ], 403);
    }
}
