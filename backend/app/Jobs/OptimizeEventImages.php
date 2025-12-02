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

    protected $eventId;
    protected $imagePaths;

    public function __construct($eventId, $imagePaths)
    {
        $this->eventId = $eventId;
        $this->imagePaths = $imagePaths;
    }

    public function handle()
    {
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
        $quality = $pathInfo['quality'] ?? 85;

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
                'variants_generated' => 8  // 4 tailles × 2 formats
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
        $sizes = [
            'sm' => 300,
            'md' => 600,
            'lg' => 1200,
            'xl' => 1920
        ];

        foreach ($sizes as $sizeKey => $targetWidth) {
            try {
                $image = $manager->read($originalJpgPath);

                // Si l'image est déjà plus petite, on la duplique
                if ($originalWidth <= $targetWidth && $originalHeight <= $targetWidth) {
                    $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                    $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                    copy($originalJpgPath, $jpgPath);
                    $image->toWebp(quality: $quality)->save($webpPath);

                    continue;
                }

                // Redimensionner
                $image->scaleDown(width: $targetWidth, height: $targetWidth);

                // Sauvegarder
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
}
