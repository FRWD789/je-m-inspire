<?php

namespace App\Http\Controllers;

use App\Models\SocialConnection;
use App\Services\Social\FacebookService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SocialConnectionController extends Controller
{
    use ApiResponse;

    /**
     * Lister les connexions sociales de l'utilisateur
     */
    public function index()
    {
        try {
            $user = Auth::user();

            $connections = SocialConnection::where('user_id', $user->id)
                ->get()
                ->map(function ($connection) {
                    return [
                        'id' => $connection->id,
                        'platform' => $connection->platform,
                        'platform_username' => $connection->platform_username,
                        'is_active' => $connection->is_active,
                        'last_synced_at' => $connection->last_synced_at,
                        'is_token_expired' => $connection->isTokenExpired(),
                        'metadata' => $connection->metadata,
                    ];
                });

            return $this->successResponse([
                'connections' => $connections,
                'available_platforms' => ['facebook', 'instagram']
            ], 'Connexions sociales récupérées');

        } catch (\Exception $e) {
            Log::error('[Social] Error fetching connections', [
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erreur lors de la récupération des connexions', 500);
        }
    }

    /**
     * Initier la liaison Facebook
     */
    public function linkFacebook()
    {
        try {
            $user = Auth::user();

            $facebookService = app(FacebookService::class);
            $url = $facebookService->getAuthorizationUrl($user->id);

            Log::info('[Facebook] OAuth initié', [
                'user_id' => $user->id
            ]);

            return $this->successResponse([
                'url' => $url
            ], 'URL d\'autorisation Facebook générée');

        } catch (\Exception $e) {
            Log::error('[Facebook] Error initiating OAuth', [
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erreur lors de l\'initiation de la liaison Facebook', 500);
        }
    }

    /**
     * Callback Facebook OAuth
     */
    public function facebookCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');

            if (!$code) {
                return $this->errorResponse('Code d\'autorisation manquant', 400);
            }

            // Vérifier si déjà traité (éviter duplicatas)
            $cacheKey = "facebook_oauth_code_{$code}";
            if (Cache::has($cacheKey)) {
                $cachedResult = Cache::get($cacheKey);
                return response()->json($cachedResult);
            }

            // Décoder le state
            $stateData = json_decode(base64_decode($state), true);
            $userId = $stateData['user_id'] ?? null;

            if (!$userId) {
                return $this->errorResponse('State invalide', 400);
            }

            // Traiter le callback
            $facebookService = app(FacebookService::class);
            $connection = $facebookService->handleCallback($code, $userId);

            $result = [
                'success' => true,
                'message' => 'Compte Facebook lié avec succès',
                'connection' => [
                    'platform' => $connection->platform,
                    'page_name' => $connection->metadata['page_name'] ?? null,
                    'page_id' => $connection->platform_page_id,
                ]
            ];

            // Mettre en cache (10 minutes)
            Cache::put($cacheKey, $result, 600);

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('[Facebook] Callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Erreur lors de la liaison : ' . $e->getMessage(), 500);
        }
    }

    /**
     * Délier une connexion sociale
     */
    public function unlink(Request $request, string $platform)
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'page_id' => 'nullable|string'
            ]);

            $query = SocialConnection::where('user_id', $user->id)
                ->where('platform', $platform);

            if (isset($validated['page_id'])) {
                $query->where('platform_page_id', $validated['page_id']);
            }

            $connection = $query->first();

            if (!$connection) {
                return $this->notFoundResponse('Connexion non trouvée');
            }

            $platformName = $connection->platform;
            $pageName = $connection->metadata['page_name'] ?? $platform;

            $connection->delete();

            Log::info('[Social] Connection unlinked', [
                'user_id' => $user->id,
                'platform' => $platformName,
                'page_id' => $connection->platform_page_id
            ]);

            return $this->successResponse(null, "Connexion {$pageName} supprimée avec succès");

        } catch (\Exception $e) {
            Log::error('[Social] Error unlinking connection', [
                'platform' => $platform,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erreur lors de la suppression de la connexion', 500);
        }
    }

    /**
     * Vérifier le statut d'une connexion
     */
    public function checkConnection(string $platform)
    {
        try {
            $user = Auth::user();

            $connection = SocialConnection::where('user_id', $user->id)
                ->where('platform', $platform)
                ->active()
                ->first();

            if (!$connection) {
                return $this->successResponse([
                    'connected' => false,
                    'platform' => $platform
                ]);
            }

            // Valider la connexion avec l'API
            $service = match ($platform) {
                'facebook' => app(FacebookService::class),
                // 'instagram' => app(InstagramService::class),
                default => null
            };

            $isValid = $service ? $service->validateConnection($connection) : false;

            if (!$isValid) {
                $connection->update(['is_active' => false]);
            }

            return $this->successResponse([
                'connected' => $isValid,
                'platform' => $platform,
                'page_name' => $connection->metadata['page_name'] ?? null,
                'page_id' => $connection->platform_page_id,
                'last_synced_at' => $connection->last_synced_at,
            ]);

        } catch (\Exception $e) {
            Log::error('[Social] Error checking connection', [
                'platform' => $platform,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erreur lors de la vérification de la connexion', 500);
        }
    }

    /**
     * Activer/désactiver une connexion
     */
    public function toggleConnection(Request $request, string $platform)
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'is_active' => 'required|boolean',
                'page_id' => 'nullable|string'
            ]);

            $query = SocialConnection::where('user_id', $user->id)
                ->where('platform', $platform);

            if (isset($validated['page_id'])) {
                $query->where('platform_page_id', $validated['page_id']);
            }

            $connection = $query->first();

            if (!$connection) {
                return $this->notFoundResponse('Connexion non trouvée');
            }

            $connection->update([
                'is_active' => $validated['is_active']
            ]);

            $status = $validated['is_active'] ? 'activée' : 'désactivée';

            Log::info('[Social] Connection toggled', [
                'user_id' => $user->id,
                'platform' => $platform,
                'is_active' => $validated['is_active']
            ]);

            return $this->successResponse(null, "Connexion {$status} avec succès");

        } catch (\Exception $e) {
            Log::error('[Social] Error toggling connection', [
                'platform' => $platform,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Erreur lors de la modification de la connexion', 500);
        }
    }
}
