<?php

namespace App\Services\Social;

use App\Contracts\SocialPlatformInterface;
use App\Models\Event;
use App\Models\SocialConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FacebookService implements SocialPlatformInterface
{
    protected string $graphVersion;
    protected string $appId;
    protected string $appSecret;
    protected string $baseUrl;

    public function __construct()
    {
        $this->graphVersion = config('services.facebook.graph_version');
        $this->appId = config('services.facebook.app_id');
        $this->appSecret = config('services.facebook.app_secret');
        $this->baseUrl = "https://graph.facebook.com/{$this->graphVersion}";
    }

    public function getPlatformName(): string
    {
        return 'facebook';
    }

    /**
     * Générer l'URL d'autorisation OAuth
     */
    public function getAuthorizationUrl(int $userId): string
    {
        $permissions = implode(',', config('services.facebook.default_permissions'));
        $redirectUri = config('app.frontend_url') . '/profile/facebook/callback';

        // State pour sécurité
        $state = base64_encode(json_encode([
            'user_id' => $userId,
            'timestamp' => now()->timestamp,
            'platform' => 'facebook'
        ]));

        $params = http_build_query([
            'client_id' => $this->appId,
            'redirect_uri' => $redirectUri,
            'state' => $state,
            'scope' => $permissions,
            'response_type' => 'code'
        ]);

        return "https://www.facebook.com/{$this->graphVersion}/dialog/oauth?{$params}";
    }

    /**
     * Traiter le callback OAuth
     */
    public function handleCallback(string $code, int $userId): SocialConnection
    {
        try {
            // Échanger le code contre un access token
            $redirectUri = config('app.frontend_url') . '/profile/facebook/callback';

            $response = Http::get("{$this->baseUrl}/oauth/access_token", [
                'client_id' => $this->appId,
                'client_secret' => $this->appSecret,
                'redirect_uri' => $redirectUri,
                'code' => $code
            ]);

            if ($response->failed()) {
                throw new \Exception('Failed to exchange code for access token: ' . $response->body());
            }

            $data = $response->json();
            $accessToken = $data['access_token'] ?? null;

            if (!$accessToken) {
                throw new \Exception('No access token in response');
            }

            // Convertir en long-lived token (60 jours)
            $longLivedResponse = Http::get("{$this->baseUrl}/oauth/access_token", [
                'grant_type' => 'fb_exchange_token',
                'client_id' => $this->appId,
                'client_secret' => $this->appSecret,
                'fb_exchange_token' => $accessToken
            ]);

            $longLivedData = $longLivedResponse->json();
            $longLivedToken = $longLivedData['access_token'] ?? $accessToken;

            // Obtenir les infos de l'utilisateur
            $meResponse = Http::get("{$this->baseUrl}/me", [
                'access_token' => $longLivedToken,
                'fields' => 'id,name,email'
            ]);

            $userData = $meResponse->json();

            // Obtenir les pages gérées par l'utilisateur
            $pagesResponse = Http::get("{$this->baseUrl}/me/accounts", [
                'access_token' => $longLivedToken,
                'fields' => 'id,name,access_token'
            ]);

            $pagesData = $pagesResponse->json();
            $pages = $pagesData['data'] ?? [];

            if (empty($pages)) {
                throw new \Exception('No Facebook pages found. You need to manage at least one page.');
            }

            // Prendre la première page (ou permettre à l'user de choisir plus tard)
            $selectedPage = $pages[0];
            $pageAccessToken = $selectedPage['access_token'];

            // Créer ou mettre à jour la connexion
            $connection = SocialConnection::updateOrCreate(
                [
                    'user_id' => $userId,
                    'platform' => 'facebook',
                    'platform_page_id' => $selectedPage['id']
                ],
                [
                    'platform_user_id' => $userData['id'],
                    'platform_username' => $userData['name'] ?? null,
                    'access_token' => $pageAccessToken, // Page token (ne expire pas)
                    'token_expires_at' => null, // Les page tokens n'expirent pas
                    'metadata' => [
                        'page_name' => $selectedPage['name'],
                        'user_name' => $userData['name'],
                        'permissions' => config('services.facebook.default_permissions'),
                        'available_pages' => array_map(fn($page) => [
                            'id' => $page['id'],
                            'name' => $page['name']
                        ], $pages)
                    ],
                    'is_active' => true,
                ]
            );

            Log::info('[Facebook] OAuth successful', [
                'user_id' => $userId,
                'page_id' => $selectedPage['id'],
                'page_name' => $selectedPage['name']
            ]);

            return $connection;

        } catch (\Exception $e) {
            Log::error('[Facebook] OAuth error', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Rafraîchir le token (les page tokens ne expirent pas, mais on peut vérifier la validité)
     */
    public function refreshToken(SocialConnection $connection): SocialConnection
    {
        // Les page tokens Facebook ne expirent pas, on vérifie juste la validité
        if ($this->validateConnection($connection)) {
            $connection->touch();
            return $connection;
        }

        throw new \Exception('Invalid Facebook connection');
    }

    /**
     * Créer un événement Facebook
     */
    public function createEvent(Event $event, SocialConnection $connection): string
    {
        try {
            // Préparer les données de l'événement
            $eventData = [
                'name' => $event->name,
                'description' => $event->description,
                'start_time' => $event->start_date->toIso8601String(),
                'end_time' => $event->end_date->toIso8601String(),
                'is_online_event' => false,
            ];

            // Ajouter la localisation si disponible
            if ($event->localisation) {
                $eventData['location'] = $event->localisation->address;
            }

            // Ajouter le lien vers l'événement sur notre site
            $eventData['ticket_uri'] = url("/events/{$event->id}");

            // Créer l'événement sur Facebook via HTTP
            $response = Http::post(
                "{$this->baseUrl}/{$connection->platform_page_id}/events",
                array_merge($eventData, [
                    'access_token' => $connection->access_token
                ])
            );

            if ($response->failed()) {
                throw new \Exception('Facebook API error: ' . $response->body());
            }

            $responseData = $response->json();
            $facebookEventId = $responseData['id'] ?? null;

            if (!$facebookEventId) {
                throw new \Exception('No event ID in Facebook response');
            }

            Log::info('[Facebook] Event created', [
                'event_id' => $event->id,
                'facebook_event_id' => $facebookEventId
            ]);

            // Upload cover image si disponible
            if ($event->banner_path) {
                $this->uploadEventImage($facebookEventId, $event->banner_path, $connection);
            }

            return $facebookEventId;

        } catch (\Exception $e) {
            Log::error('[Facebook] Error creating event', [
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Mettre à jour un événement Facebook
     */
    public function updateEvent(Event $event, SocialConnection $connection): bool
    {
        try {
            $facebookEventId = $event->getSocialPlatformId('facebook');

            if (!$facebookEventId) {
                throw new \Exception('No Facebook event ID found');
            }

            $eventData = [
                'name' => $event->name,
                'description' => $event->description,
                'start_time' => $event->start_date->toIso8601String(),
                'end_time' => $event->end_date->toIso8601String(),
                'access_token' => $connection->access_token
            ];

            if ($event->localisation) {
                $eventData['location'] = $event->localisation->address;
            }

            $response = Http::post(
                "{$this->baseUrl}/{$facebookEventId}",
                $eventData
            );

            if ($response->failed()) {
                throw new \Exception('Facebook API error: ' . $response->body());
            }

            // Re-upload cover image si changée
            if ($event->banner_path) {
                $this->uploadEventImage($facebookEventId, $event->banner_path, $connection);
            }

            Log::info('[Facebook] Event updated', [
                'event_id' => $event->id,
                'facebook_event_id' => $facebookEventId
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('[Facebook] Error updating event', [
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Supprimer un événement Facebook
     */
    public function deleteEvent(string $platformEventId, SocialConnection $connection): bool
    {
        try {
            $response = Http::delete(
                "{$this->baseUrl}/{$platformEventId}",
                [
                    'access_token' => $connection->access_token
                ]
            );

            if ($response->failed() && $response->status() !== 404) {
                // 404 = déjà supprimé, c'est OK
                throw new \Exception('Facebook API error: ' . $response->body());
            }

            Log::info('[Facebook] Event deleted', [
                'facebook_event_id' => $platformEventId
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('[Facebook] Error deleting event', [
                'facebook_event_id' => $platformEventId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Upload l'image de couverture de l'événement
     */
    public function uploadEventImage(string $platformEventId, string $imagePath, SocialConnection $connection): bool
    {
        try {
            // Générer une URL publique temporaire
            $publicUrl = $this->generatePublicImageUrl($imagePath);

            // Upload vers Facebook
            $response = Http::post(
                "{$this->baseUrl}/{$platformEventId}/picture",
                [
                    'url' => $publicUrl,
                    'access_token' => $connection->access_token
                ]
            );

            if ($response->failed()) {
                throw new \Exception('Facebook API error: ' . $response->body());
            }

            Log::info('[Facebook] Event cover uploaded', [
                'facebook_event_id' => $platformEventId
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('[Facebook] Error uploading cover', [
                'facebook_event_id' => $platformEventId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Valider que la connexion est active
     */
    public function validateConnection(SocialConnection $connection): bool
    {
        try {
            $response = Http::get(
                "{$this->baseUrl}/{$connection->platform_page_id}",
                [
                    'fields' => 'id,name',
                    'access_token' => $connection->access_token
                ]
            );

            return $response->successful() && !empty($response->json()['id']);

        } catch (\Exception $e) {
            Log::warning('[Facebook] Connection validation failed', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Générer une URL publique accessible pour une image
     */
    private function generatePublicImageUrl(string $imagePath): string
    {
        // Si l'image est déjà une URL
        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return $imagePath;
        }

        // Générer une URL signée temporaire (expire dans 1 heure)
        return Storage::disk('public')->temporaryUrl(
            $imagePath,
            now()->addHour()
        );
    }
}
