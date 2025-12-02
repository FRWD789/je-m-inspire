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

    public $timeout = 600; // 10 minutes max
    public $tries = 2;

    protected $eventId;
    protected $imagePaths;

    /**
     * @param int $eventId
     * @param array $imagePaths
     */
    public function __construct($eventId, $imagePaths)
    {
        $this->eventId = $eventId;
        $this->imagePaths = $imagePaths;

        // ✅ Définir la queue via la méthode au lieu de la propriété
        $this->onQueue('images');
    }

    public function handle()
    {
        // ✅ Augmenter la limite mémoire pour ce job
        ini_set('memory_limit', '1024M'); // 1GB pour traiter les images

        Log::info('[OptimizeJob] Début optimisation', [
            'event_id' => $this->eventId,
            'images_count' => count($this->imagePaths),
            'memory_limit' => ini_get('memory_limit')
        ]);

        foreach ($this->imagePaths as $index => $pathInfo) {
            try {
                // ✅ VALIDATION : Vérifier que $pathInfo est bien un tableau
                if (!is_array($pathInfo)) {
                    Log::error('[OptimizeJob] pathInfo n\'est pas un tableau', [
                        'event_id' => $this->eventId,
                        'index' => $index,
                        'pathInfo_type' => gettype($pathInfo),
                        'pathInfo_value' => is_string($pathInfo) ? $pathInfo : json_encode($pathInfo)
                    ]);
                    continue;
                }

                // ✅ VALIDATION : Vérifier que temp_path existe et est une chaîne
                if (!isset($pathInfo['temp_path']) || !is_string($pathInfo['temp_path'])) {
                    Log::error('[OptimizeJob] temp_path invalide', [
                        'event_id' => $this->eventId,
                        'index' => $index,
                        'pathInfo' => json_encode($pathInfo),
                        'temp_path_type' => isset($pathInfo['temp_path']) ? gettype($pathInfo['temp_path']) : 'missing'
                    ]);
                    continue;
                }

                Log::info("[OptimizeJob] Traitement image {$index}/" . count($this->imagePaths), [
                    'path' => $pathInfo['temp_path'],
                    'directory' => $pathInfo['directory'] ?? 'unknown',
                    'memory_usage' => round(memory_get_usage(true) / 1024 / 1024) . 'MB'
                ]);

                $this->optimizeImage($pathInfo);

                // ✅ Libérer la mémoire après chaque image
                gc_collect_cycles();

            } catch (\Exception $e) {
                Log::error('[OptimizeJob] Erreur sur image', [
                    'event_id' => $this->eventId,
                    'index' => $index,
                    'path' => is_array($pathInfo) && isset($pathInfo['temp_path']) ? $pathInfo['temp_path'] : json_encode($pathInfo),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'memory' => round(memory_get_usage(true) / 1024 / 1024) . 'MB'
                ]);

                // ⚠️ Ne pas faire échouer tout le job pour une image
                continue;
            }
        }

        Log::info('[OptimizeJob] Optimisation terminée', [
            'event_id' => $this->eventId,
            'peak_memory' => round(memory_get_peak_usage(true) / 1024 / 1024) . 'MB'
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
        $quality = $pathInfo['quality'] ?? 80;

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
                'size' => "{$originalWidth}x{$originalHeight}",
                'file_size' => round(filesize($fullPath) / 1024 / 1024, 2) . 'MB'
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

            // ✅ Libérer mémoire après JPEG
            unset($image);
            gc_collect_cycles();

            // ✅ Recharger pour WebP (évite de garder 2 versions en RAM)
            $image = $manager->read($jpgPath);
            $image->toWebp(quality: $quality)->save($webpPath);

            // ✅ Libérer mémoire
            unset($image);
            gc_collect_cycles();

            // Générer les variantes
            $this->generateVariants(
                $jpgPath,
                $directory,
                $basename,
                $quality,
                $manager
            );

            // Supprimer le fichier original si ce n'est pas un JPG
            if ($extension !== 'jpg' && $extension !== 'jpeg' && file_exists($fullPath)) {
                unlink($fullPath);
            }

            Log::info('[OptimizeJob] Optimisation réussie', [
                'path' => $tempPath,
                'variants_generated' => 6, // md, lg, xl × 2 formats (jpg + webp)
                'memory' => round(memory_get_usage(true) / 1024 / 1024) . 'MB'
            ]);

        } catch (\Exception $e) {
            Log::error('[OptimizeJob] Erreur optimisation', [
                'path' => $tempPath,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            throw $e;
        }
    }

    /**
     * Génère les variantes responsive (3 tailles optimales)
     */
    private function generateVariants(
        string $originalJpgPath,
        string $directory,
        string $basename,
        int $quality,
        ImageManager $manager
    ): void {
        // ✅ 3 tailles pour couvrir tous les cas d'usage
        $sizes = [
            'md' => 600,  // Mobile/Thumbnail
            'lg' => 1200, // Desktop
            'xl' => 1920, // Grandes images (carrousel, hero)
        ];

        foreach ($sizes as $sizeKey => $targetWidth) {
            try {
                // ✅ Charger depuis le JPG original
                $image = $manager->read($originalJpgPath);
                $originalWidth = $image->width();
                $originalHeight = $image->height();

                // Si déjà plus petite, dupliquer
                if ($originalWidth <= $targetWidth && $originalHeight <= $targetWidth) {
                    $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                    $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                    copy($originalJpgPath, $jpgPath);
                    $image->toWebp(quality: $quality)->save($webpPath);

                    unset($image);
                    gc_collect_cycles();
                    continue;
                }

                // Redimensionner
                $image->scaleDown(width: $targetWidth, height: $targetWidth);

                // Sauvegarder JPG
                $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                $image->toJpeg(quality: $quality)->save($jpgPath);

                // ✅ Libérer avant WebP
                unset($image);
                gc_collect_cycles();

                // Recharger pour WebP
                $imageWebp = $manager->read($jpgPath);
                $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");
                $imageWebp->toWebp(quality: $quality)->save($webpPath);

                // ✅ Libérer
                unset($imageWebp);
                gc_collect_cycles();

            } catch (\Exception $e) {
                Log::error("[OptimizeJob] Erreur variante {$sizeKey}", [
                    'error' => $e->getMessage(),
                    'basename' => $basename
                ]);
            }
        }
    }

    /**
     * Gérer l'échec du job
     */
    public function failed(\Throwable $exception)
    {
        Log::error('[OptimizeJob] Job échoué définitivement', [
            'event_id' => $this->eventId,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
            'images_count' => count($this->imagePaths)
        ]);
    }
}
