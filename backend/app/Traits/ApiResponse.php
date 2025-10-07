<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    /**
     * Réponse de succès avec données
     */
    protected function successResponse($data = null, string $message = 'Opération réussie', int $status = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        $response['meta'] = [
            'timestamp' => now()->toIso8601String(),
        ];

        return response()->json($response, $status);
    }

    /**
     * Réponse de succès avec resource
     */
    protected function resourceResponse(JsonResource $resource, string $message = 'Opération réussie', int $status = 200): JsonResponse
    {
        return $this->successResponse($resource, $message, $status);
    }

    /**
     * Réponse de succès avec collection
     */
    protected function collectionResponse(ResourceCollection $collection, string $message = 'Données récupérées', int $status = 200): JsonResponse
    {
        return $this->successResponse($collection, $message, $status);
    }

    /**
     * Réponse d'erreur
     */
    protected function errorResponse(string $message = 'Une erreur est survenue', int $status = 400, array $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        $response['meta'] = [
            'timestamp' => now()->toIso8601String(),
        ];

        return response()->json($response, $status);
    }

    /**
     * Réponse de validation échouée
     */
    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return $this->errorResponse('Erreur de validation', 422, $errors);
    }

    /**
     * Réponse non trouvé
     */
    protected function notFoundResponse(string $message = 'Ressource non trouvée'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Réponse non autorisé
     */
    protected function unauthorizedResponse(string $message = 'Non autorisé'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * Réponse non authentifié
     */
    protected function unauthenticatedResponse(string $message = 'Non authentifié'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }
}
