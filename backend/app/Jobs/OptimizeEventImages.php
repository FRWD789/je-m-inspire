<?php

namespace App\Jobs;

use App\Models\Event;
use App\Models\EventImage;
use App\Traits\OptimizesImages;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
        Log::info('[OptimizeJob] Début optimisation', [
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
            // Extraire les infos du fichier
            $filePathInfo = pathinfo($tempPath);
            $basename = $filePathInfo['filename'];
            $extension = strtolower($filePathInfo['extension']);

            // Augmenter limite mémoire
            $originalMemoryLimit = ini_get('memory_limit');
            ini_set('memory_limit', '1024M');

            // Charger l'image
            $imageInfo = getimagesize($fullPath);
            if (!$imageInfo) {
                throw new \Exception("Impossible de lire l'image");
            }

            list($originalWidth, $originalHeight, $type) = $imageInfo;

            // Charger l'image source
            $source = $this->loadImageFromFile($fullPath, $type);
            if (!$source) {
                throw new \Exception("Impossible de charger l'image");
            }

            // Convertir en JPG + WebP si ce n'est pas déjà fait
            $originalJpgPath = storage_path("app/public/{$directory}/{$basename}.jpg");
            $originalWebpPath = storage_path("app/public/{$directory}/{$basename}.webp");

            if (!file_exists($originalJpgPath) || $extension !== 'jpg') {
                // Redimensionner si nécessaire
                if ($originalWidth > $maxWidth || $originalHeight > $maxWidth) {
                    $ratio = min($maxWidth / $originalWidth, $maxWidth / $originalHeight);
                    $newWidth = (int)($originalWidth * $ratio);
                    $newHeight = (int)($originalHeight * $ratio);

                    $resized = imagecreatetruecolor($newWidth, $newHeight);
                    $white = imagecolorallocate($resized, 255, 255, 255);
                    imagefill($resized, 0, 0, $white);

                    imagecopyresampled(
                        $resized, $source,
                        0, 0, 0, 0,
                        $newWidth, $newHeight,
                        $originalWidth, $originalHeight
                    );

                    imagejpeg($resized, $originalJpgPath, $quality);
                    imagewebp($resized, $originalWebpPath, $quality);
                    imagedestroy($resized);

                    $originalWidth = $newWidth;
                    $originalHeight = $newHeight;
                } else {
                    // Image déjà assez petite
                    $newImg = imagecreatetruecolor($originalWidth, $originalHeight);
                    $white = imagecolorallocate($newImg, 255, 255, 255);
                    imagefill($newImg, 0, 0, $white);
                    imagecopy($newImg, $source, 0, 0, 0, 0, $originalWidth, $originalHeight);

                    imagejpeg($newImg, $originalJpgPath, $quality);
                    imagewebp($newImg, $originalWebpPath, $quality);
                    imagedestroy($newImg);
                }
            }

            // Générer les variantes responsive
            $this->generateVariantsFromExistingFile(
                $originalJpgPath,
                $directory,
                $basename,
                $originalWidth,
                $originalHeight,
                $quality
            );

            // Supprimer le fichier original si différent de JPG
            if ($extension !== 'jpg' && $extension !== 'jpeg' && file_exists($fullPath)) {
                unlink($fullPath);
            }

            imagedestroy($source);
            gc_collect_cycles();
            ini_set('memory_limit', $originalMemoryLimit);

            Log::info('[OptimizeJob] Image optimisée avec succès', [
                'path' => $tempPath,
                'directory' => $directory,
                'basename' => $basename,
                'original_size' => $originalWidth . 'x' . $originalHeight
            ]);

        } catch (\Exception $e) {
            Log::error('[OptimizeJob] Erreur optimisation', [
                'path' => $tempPath,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Charger une image depuis un fichier
     */
    private function loadImageFromFile($filePath, $type)
    {
        switch ($type) {
            case IMAGETYPE_JPEG:
                return @imagecreatefromjpeg($filePath);
            case IMAGETYPE_PNG:
                $img = @imagecreatefrompng($filePath);
                if ($img) {
                    $width = imagesx($img);
                    $height = imagesy($img);
                    $newImg = imagecreatetruecolor($width, $height);
                    $white = imagecolorallocate($newImg, 255, 255, 255);
                    imagefill($newImg, 0, 0, $white);
                    imagecopy($newImg, $img, 0, 0, 0, 0, $width, $height);
                    imagedestroy($img);
                    return $newImg;
                }
                return false;
            case IMAGETYPE_GIF:
                return @imagecreatefromgif($filePath);
            case IMAGETYPE_WEBP:
                return @imagecreatefromwebp($filePath);
            default:
                return false;
        }
    }

    /**
     * Générer les variantes à partir d'un fichier JPG existant
     */
    private function generateVariantsFromExistingFile($originalJpgPath, $directory, $basename, $originalWidth, $originalHeight, $quality)
    {
        $sizes = [
            'sm' => 300,
            'md' => 600,
            'lg' => 1200,
            'xl' => 1920
        ];

        $source = imagecreatefromjpeg($originalJpgPath);
        if (!$source) return;

        foreach ($sizes as $sizeKey => $targetWidth) {
            // Si l'image est plus petite, dupliquer
            if ($originalWidth <= $targetWidth && $originalHeight <= $targetWidth) {
                $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                copy($originalJpgPath, $jpgPath);

                $tempSource = imagecreatefromjpeg($originalJpgPath);
                imagewebp($tempSource, $webpPath, $quality);
                imagedestroy($tempSource);

                continue;
            }

            // Redimensionner en préservant l'aspect ratio
            $ratio = min($targetWidth / $originalWidth, $targetWidth / $originalHeight);
            $newWidth = (int)($originalWidth * $ratio);
            $newHeight = (int)($originalHeight * $ratio);

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            $white = imagecolorallocate($resized, 255, 255, 255);
            imagefill($resized, 0, 0, $white);

            imagecopyresampled(
                $resized, $source,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $originalWidth, $originalHeight
            );

            $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
            $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

            imagejpeg($resized, $jpgPath, $quality);
            imagewebp($resized, $webpPath, $quality);

            imagedestroy($resized);
        }

        imagedestroy($source);
        gc_collect_cycles();
    }
}
