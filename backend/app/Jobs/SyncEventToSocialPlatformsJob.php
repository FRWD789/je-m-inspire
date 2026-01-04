<?php

namespace App\Jobs;

use App\Contracts\SocialPlatformInterface;
use App\Models\Event;
use App\Models\SocialConnection;
use App\Services\Social\FacebookService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncEventToSocialPlatformsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;
    public $backoff = [60, 300, 900]; // Retry après 1min, 5min, 15min

    protected Event $event;
    protected string $action; // 'create', 'update', 'delete'
    protected ?array $platforms; // null = toutes les plateformes actives

    /**
     * @param Event $event
     * @param string $action 'create', 'update', 'delete'
     * @param array|null $platforms Plateformes spécifiques ou null pour toutes
     */
    public function __construct(Event $event, string $action = 'create', ?array $platforms = null)
    {
        $this->event = $event;
        $this->action = $action;
        $this->platforms = $platforms;
        $this->queue = 'default';
    }

    public function handle(): void
    {
        $debug = config('app.debug');

        if ($debug) {
            Log::info('[Social Sync] Job started', [
                'event_id' => $this->event->id,
                'action' => $this->action,
                'platforms' => $this->platforms ?? 'all'
            ]);
        }

        // Vérifier que l'événement peut être synchronisé
        if (!$this->event->canBeSynced() && $this->action !== 'delete') {
            Log::warning('[Social Sync] Event cannot be synced', [
                'event_id' => $this->event->id,
                'sync_status' => $this->event->sync_status
            ]);
            return;
        }

        // Obtenir le créateur de l'événement
        $creator = $this->event->creator;

        if (!$creator) {
            Log::error('[Social Sync] Event has no creator', [
                'event_id' => $this->event->id
            ]);
            return;
        }

        // Récupérer les connexions sociales actives de l'utilisateur
        $query = SocialConnection::where('user_id', $creator->id)
            ->active();

        // Filtrer par plateformes si spécifié
        if ($this->platforms !== null) {
            $query->whereIn('platform', $this->platforms);
        }

        $connections = $query->get();

        if ($connections->isEmpty()) {
            if ($debug) {
                Log::info('[Social Sync] No active social connections', [
                    'user_id' => $creator->id,
                    'platforms' => $this->platforms ?? 'all'
                ]);
            }
            return;
        }

        // Synchroniser sur chaque plateforme
        foreach ($connections as $connection) {
            try {
                $this->syncToPlatform($connection);
            } catch (\Exception $e) {
                Log::error('[Social Sync] Platform sync failed', [
                    'event_id' => $this->event->id,
                    'platform' => $connection->platform,
                    'error' => $e->getMessage()
                ]);

                // Enregistrer l'erreur sur l'event
                $this->event->setSyncError($connection->platform, $e->getMessage());
            }
        }

        // Mettre à jour le statut global de sync
        $this->updateEventSyncStatus();
    }

    /**
     * Synchroniser vers une plateforme spécifique
     */
    protected function syncToPlatform(SocialConnection $connection): void
    {
        $service = $this->getPlatformService($connection->platform);

        // Valider la connexion avant de continuer
        if (!$service->validateConnection($connection)) {
            throw new \Exception("Invalid {$connection->platform} connection");
        }

        switch ($this->action) {
            case 'create':
                $platformEventId = $service->createEvent($this->event, $connection);
                $this->event->setSocialPlatformId($connection->platform, $platformEventId);
                $this->event->markAsSynced($connection->platform);
                break;

            case 'update':
                $platformEventId = $this->event->getSocialPlatformId($connection->platform);

                if ($platformEventId) {
                    // Update existing event
                    $service->updateEvent($this->event, $connection);
                } else {
                    // Create if doesn't exist
                    $platformEventId = $service->createEvent($this->event, $connection);
                    $this->event->setSocialPlatformId($connection->platform, $platformEventId);
                }

                $this->event->markAsSynced($connection->platform);
                break;

            case 'delete':
                $platformEventId = $this->event->getSocialPlatformId($connection->platform);

                if ($platformEventId) {
                    $service->deleteEvent($platformEventId, $connection);
                    $this->event->removeSocialPlatformId($connection->platform);
                }
                break;
        }

        Log::info('[Social Sync] Platform sync successful', [
            'event_id' => $this->event->id,
            'platform' => $connection->platform,
            'action' => $this->action
        ]);
    }

    /**
     * Obtenir le service pour une plateforme
     */
    protected function getPlatformService(string $platform): SocialPlatformInterface
    {
        return match ($platform) {
            'facebook' => app(FacebookService::class),
            'instagram' => app(\App\Services\Social\InstagramService::class),
            default => throw new \Exception("Unsupported platform: {$platform}")
        };
    }

    /**
     * Mettre à jour le statut de sync global de l'événement
     */
    protected function updateEventSyncStatus(): void
    {
        $errors = $this->event->sync_errors ?? [];

        if (empty($errors)) {
            $this->event->sync_status = 'synced';
        } else {
            $this->event->sync_status = 'failed';
        }

        $this->event->last_synced_at = now();
        $this->event->save();
    }

    /**
     * Gestion des échecs
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('[Social Sync] Job failed permanently', [
            'event_id' => $this->event->id,
            'action' => $this->action,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Marquer l'événement comme ayant échoué
        $this->event->sync_status = 'failed';
        $this->event->save();
    }
}
