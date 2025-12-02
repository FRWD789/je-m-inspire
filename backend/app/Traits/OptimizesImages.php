<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

/**
 * Trait OptimizesImages - VERSION INTERVENTION IMAGE
 *
 * ✅ API simple et fluide
 * ✅ Gestion automatique de la mémoire
 * ✅ Support natif WebP
 * ✅ Préserve l'aspect ratio automatiquement
 * ✅ Moins de code, moins de bugs
 */
trait OptimizesImages
{
    /**
     * Instance du gestionnaire d'images
     */
    protected function getImageManager(): ImageManager
    {
        return new ImageManager(new Driver());
    }

    /**
     * Optimise et sauvegarde une image en plusieurs tailles + WebP
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $directory (ex: 'event_images', 'event_thumbnails')
     * @param int $maxWidth (max 1920px)
     * @param int $quality (1-100, recommandé: 85)
     * @return string Chemin relatif du JPG original (ex: 'event_images/123_abc.jpg')
     */
    public function optimizeAndSaveImage($file, $directory, $maxWidth = 1920, $quality = 85): string
    {
        $baseFilename = time() . '_' . \Illuminate\Support\Str::random(10);
        $tempPath = $file->storeAs($directory, $baseFilename . '.' . $file->getClientOriginalExtension(), 'public');
        $fullPath = storage_path('app/public/' . $tempPath);

        try {
            $manager = $this->getImageManager();

            // Charger l'image
            $image = $manager->read($fullPath);

            // Obtenir dimensions originales
            $originalWidth = $image->width();
            $originalHeight = $image->height();

            Log::info('[OptimizeImage] Image chargée', [
                'original_size' => "{$originalWidth}x{$originalHeight}",
                'file_size' => filesize($fullPath) . ' bytes'
            ]);

            // ÉTAPE 1 : Redimensionner l'image principale si nécessaire
            if ($originalWidth > $maxWidth || $originalHeight > $maxWidth) {
                $image->scaleDown(width: $maxWidth, height: $maxWidth);
                Log::info('[OptimizeImage] Image redimensionnée', [
                    'new_size' => $image->width() . 'x' . $image->height()
                ]);
            }

            // ÉTAPE 2 : Sauvegarder en JPG et WebP
            $jpgPath = storage_path("app/public/{$directory}/{$baseFilename}.jpg");
            $webpPath = storage_path("app/public/{$directory}/{$baseFilename}.webp");

            $image->toJpeg(quality: $quality)->save($jpgPath);
            $image->toWebp(quality: $quality)->save($webpPath);

            // ÉTAPE 3 : Générer les variantes responsive
            $this->generateResponsiveVariants(
                $jpgPath,
                $directory,
                $baseFilename,
                $image->width(),
                $image->height(),
                $quality
            );

            // ÉTAPE 4 : Supprimer le fichier temporaire si différent
            if (pathinfo($tempPath, PATHINFO_EXTENSION) !== 'jpg') {
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }

            Log::info('[OptimizeImage] Optimisation terminée', [
                'directory' => $directory,
                'basename' => $baseFilename,
                'variants' => ['sm', 'md', 'lg', 'xl'],
                'formats' => ['jpg', 'webp']
            ]);

            return "{$directory}/{$baseFilename}.jpg";

        } catch (\Exception $e) {
            Log::error('[OptimizeImage] Erreur: ' . $e->getMessage(), [
                'file' => $tempPath,
                'directory' => $directory,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Génère TOUTES les variantes responsive
     */
    private function generateResponsiveVariants(
        string $originalJpgPath,
        string $directory,
        string $basename,
        int $originalWidth,
        int $originalHeight,
        int $quality
    ): void {
        $sizes = [
            'sm' => 300,
            'md' => 600,
            'lg' => 1200,
            'xl' => 1920
        ];

        $manager = $this->getImageManager();

        foreach ($sizes as $sizeKey => $targetWidth) {
            try {
                // Charger l'image originale pour chaque variante
                $image = $manager->read($originalJpgPath);

                // Si l'image est déjà plus petite que la cible, on la duplique
                if ($originalWidth <= $targetWidth && $originalHeight <= $targetWidth) {
                    $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                    $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                    copy($originalJpgPath, $jpgPath);
                    $image->toWebp(quality: $quality)->save($webpPath);

                    continue;
                }

                // Redimensionner en préservant l'aspect ratio
                $image->scaleDown(width: $targetWidth, height: $targetWidth);

                // Sauvegarder en JPG et WebP
                $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                $image->toJpeg(quality: $quality)->save($jpgPath);
                $image->toWebp(quality: $quality)->save($webpPath);

                Log::info("[OptimizeImage] Variante {$sizeKey} créée", [
                    'size' => $image->width() . 'x' . $image->height()
                ]);

            } catch (\Exception $e) {
                Log::error("[OptimizeImage] Erreur variante {$sizeKey}: " . $e->getMessage());
            }
        }
    }
}
