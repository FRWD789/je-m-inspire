<?php

namespace App\Jobs;

use App\Models\Event;
use App\Models\EventImage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class OptimizeEventImages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes max
    public $tries = 3;

    public $queue = 'images';

    protected $eventId;
    protected $imagePaths;

    public function __construct($eventId, $imagePaths)
    {
        $this->eventId = $eventId;
        $this->imagePaths = $imagePaths;
    }

    public function handle()
    {
        $availableMemory = $this->getAvailableMemory();

        if ($availableMemory < 256) {
            Log::warning('[OptimizeJob] RAM insuffisante, job reporté', [
                'memory_available' => $availableMemory . 'MB'
            ]);
            $this->release(60); // Réessayer dans 60 secondes
            return;
        }

        Log::info('[OptimizeJob] Début optimisation avec Intervention Image', [
            'event_id' => $this->eventId,
            'images_count' => count($this->imagePaths)
        ]);

        foreach ($this->imagePaths as $pathInfo) {
            try {
                $this->optimizeImage($pathInfo);
            } catch (\Exception $e) {
                Log::error('[OptimizeJob] Erreur sur image', [
                    'event_id' => $this->eventId,
                    'path' => $pathInfo['temp_path'] ?? 'unknown',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        Log::info('[OptimizeJob] Optimisation terminée', [
            'event_id' => $this->eventId
        ]);
    }

    /**
     * Optimise une image avec Intervention Image
     */
    private function optimizeImage($pathInfo)
    {
        $tempPath = $pathInfo['temp_path'];
        $directory = $pathInfo['directory'];
        $maxWidth = $pathInfo['max_width'] ?? 1200;
        $quality = 80;

        $fullPath = storage_path('app/public/' . $tempPath);

        if (!file_exists($fullPath)) {
            Log::warning('[OptimizeJob] Fichier introuvable', ['path' => $tempPath]);
            return;
        }

        try {
            $filePathInfo = pathinfo($tempPath);
            $basename = $filePathInfo['filename'];
            $extension = strtolower($filePathInfo['extension']);

            $manager = new ImageManager(new Driver());

            // Charger l'image
            $image = $manager->read($fullPath);
            $originalWidth = $image->width();
            $originalHeight = $image->height();

            Log::info('[OptimizeJob] Image chargée', [
                'path' => $tempPath,
                'size' => "{$originalWidth}x{$originalHeight}"
            ]);

            // Redimensionner si nécessaire
            if ($originalWidth > $maxWidth || $originalHeight > $maxWidth) {
                $image->scaleDown(width: $maxWidth, height: $maxWidth);
                Log::info('[OptimizeJob] Image redimensionnée', [
                    'new_size' => $image->width() . 'x' . $image->height()
                ]);
            }

            // Sauvegarder en JPG et WebP
            $jpgPath = storage_path("app/public/{$directory}/{$basename}.jpg");
            $webpPath = storage_path("app/public/{$directory}/{$basename}.webp");

            $image->toJpeg(quality: $quality)->save($jpgPath);
            $image->toWebp(quality: $quality)->save($webpPath);

            // Générer les variantes
            $this->generateVariants(
                $jpgPath,
                $directory,
                $basename,
                $image->width(),
                $image->height(),
                $quality,
                $manager
            );

            // Supprimer le fichier original si ce n'est pas un JPG
            if ($extension !== 'jpg' && $extension !== 'jpeg' && file_exists($fullPath)) {
                unlink($fullPath);
            }

            Log::info('[OptimizeJob] Optimisation réussie', [
                'path' => $tempPath,
                'variants_generated' => 6,  // Original + 2 tailles × 2 formats
                'peak_memory' => round(memory_get_peak_usage(true) / 1024 / 1024) . 'MB'
            ]);

        } catch (\Exception $e) {
            Log::error('[OptimizeJob] Erreur optimisation', [
                'path' => $tempPath,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Génère les variantes responsive
     */
   private function generateVariants(
        string $originalJpgPath,
        string $directory,
        string $basename,
        int $originalWidth,
        int $originalHeight,
        int $quality,
        ImageManager $manager
    ): void {
        // ⬇️ RÉDUIRE À 2 TAILLES AU LIEU DE 4
        $sizes = [
            'md' => 400,  // Mobile/Thumbnail
            'lg' => 800,  // Desktop
        ];

        foreach ($sizes as $sizeKey => $targetWidth) {
            try {
                $image = $manager->read($originalJpgPath);

                if ($originalWidth <= $targetWidth && $originalHeight <= $targetWidth) {
                    $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                    $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");
                    copy($originalJpgPath, $jpgPath);
                    $image->toWebp(quality: $quality)->save($webpPath);
                    continue;
                }

                $image->scaleDown(width: $targetWidth, height: $targetWidth);

                $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                $image->toJpeg(quality: $quality)->save($jpgPath);
                $image->toWebp(quality: $quality)->save($webpPath);

            } catch (\Exception $e) {
                Log::error("[OptimizeJob] Erreur variante {$sizeKey}", [
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    private function getAvailableMemory(): int
    {
        if (PHP_OS_FAMILY !== 'Linux') {
            return 1024; // Valeur par défaut hors Linux
        }

        try {
            $meminfo = file_get_contents('/proc/meminfo');
            if (preg_match('/MemAvailable:\s+(\d+)/', $meminfo, $matches)) {
                return (int)($matches[1] / 1024); // Convertir KB en MB
            }
        } catch (\Exception $e) {
            Log::warning('[OptimizeJob] Impossible de lire meminfo', [
                'error' => $e->getMessage()
            ]);
        }

        return 512; // Valeur par défaut si échec lecture
    }
}
