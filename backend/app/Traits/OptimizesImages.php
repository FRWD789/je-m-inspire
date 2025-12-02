<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Trait OptimizesImages - VERSION AMÉLIORÉE
 *
 * Génère PLUSIEURS tailles d'images + conversion WebP automatique
 * pour optimiser les performances selon recommandations Google Lighthouse
 */
trait OptimizesImages
{
    /**
     * Optimise et sauvegarde une image en plusieurs tailles + WebP
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $directory (ex: 'event_images')
     * @param int $maxWidth (ignoré, on génère toutes les tailles)
     * @param int $quality (qualité JPEG/WebP 1-100)
     * @return string Chemin de l'image originale optimisée
     */
    public function optimizeAndSaveImage($file, $directory, $maxWidth = 1920, $quality = 85)
    {
        $baseFilename = time() . '_' . Str::random(10);
        $extension = $file->getClientOriginalExtension();

        // Sauvegarder temporairement l'original
        $tempPath = $file->storeAs($directory, $baseFilename . '.' . $extension, 'public');
        $fullPath = storage_path('app/public/' . $tempPath);

        // Augmenter limite mémoire temporairement
        $originalMemoryLimit = ini_get('memory_limit');
        ini_set('memory_limit', '1024M');

        try {
            // Générer les 4 tailles + WebP pour chacune
            $this->generateResponsiveImages($fullPath, $directory, $baseFilename, $quality);

            Log::info('[OptimizeImage] Images responsives générées', [
                'directory' => $directory,
                'basename' => $baseFilename,
                'sizes' => ['300px', '600px', '1200px', '1920px'],
                'formats' => ['original', 'webp']
            ]);

        } finally {
            ini_set('memory_limit', $originalMemoryLimit);
        }

        return $tempPath; // Retourne le chemin original pour compatibilité
    }

    /**
     * Génère toutes les tailles responsive + WebP
     *
     * Tailles générées :
     * - 300px : thumbnail mobile
     * - 600px : mobile landscape
     * - 1200px : desktop
     * - 1920px : full HD
     */
    private function generateResponsiveImages($originalPath, $directory, $basename, $quality)
    {
        $imageInfo = getimagesize($originalPath);
        if (!$imageInfo) return;

        list($originalWidth, $originalHeight, $type) = $imageInfo;

        // Définir les tailles à générer
        $sizes = [
            'sm' => 300,   // Small - Mobile portrait
            'md' => 600,   // Medium - Mobile landscape
            'lg' => 1200,  // Large - Desktop
            'xl' => 1920   // X-Large - Full HD
        ];

        foreach ($sizes as $sizeKey => $targetWidth) {
            // Skip si l'original est plus petit que la taille cible
            if ($originalWidth <= $targetWidth) {
                continue;
            }

            // Calculer les dimensions proportionnelles
            $ratio = $targetWidth / $originalWidth;
            $newWidth = $targetWidth;
            $newHeight = (int)($originalHeight * $ratio);

            // Charger l'image source
            $source = $this->loadImage($originalPath, $type);
            if (!$source) continue;

            // Créer l'image redimensionnée
            $resized = imagecreatetruecolor($newWidth, $newHeight);

            // Préserver la transparence pour PNG/GIF
            if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
                $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
                imagefill($resized, 0, 0, $transparent);
            }

            // Redimensionner
            imagecopyresampled(
                $resized, $source,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $originalWidth, $originalHeight
            );

            // Sauvegarder en format original
            $resizedPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
            imagejpeg($resized, $resizedPath, $quality);

            // Sauvegarder en WebP (format moderne, meilleure compression)
            $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");
            imagewebp($resized, $webpPath, $quality);

            // Libérer mémoire
            imagedestroy($resized);
            imagedestroy($source);
            gc_collect_cycles();
        }
    }

    /**
     * Charge une image depuis le disque
     */
    private function loadImage($filePath, $type)
    {
        switch ($type) {
            case IMAGETYPE_JPEG:
                return @imagecreatefromjpeg($filePath);
            case IMAGETYPE_PNG:
                return @imagecreatefrompng($filePath);
            case IMAGETYPE_GIF:
                return @imagecreatefromgif($filePath);
            case IMAGETYPE_WEBP:
                return @imagecreatefromwebp($filePath);
            default:
                return false;
        }
    }

    /**
     * Méthode utilitaire : Obtenir toutes les variantes d'une image
     *
     * @param string $originalPath Chemin original (ex: 'event_images/123_abc.jpg')
     * @return array URLs de toutes les variantes
     */
    public function getImageVariants($originalPath)
    {
        if (!$originalPath) {
            return [
                'original' => null,
                'sm' => null,
                'md' => null,
                'lg' => null,
                'xl' => null,
                'sm_webp' => null,
                'md_webp' => null,
                'lg_webp' => null,
                'xl_webp' => null,
            ];
        }

        $pathInfo = pathinfo($originalPath);
        $directory = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];

        $baseUrl = config('app.url') . '/storage';

        return [
            'original' => "{$baseUrl}/{$originalPath}",
            'sm' => "{$baseUrl}/{$directory}/{$filename}_sm.jpg",
            'md' => "{$baseUrl}/{$directory}/{$filename}_md.jpg",
            'lg' => "{$baseUrl}/{$directory}/{$filename}_lg.jpg",
            'xl' => "{$baseUrl}/{$directory}/{$filename}_xl.jpg",
            'sm_webp' => "{$baseUrl}/{$directory}/{$filename}_sm.webp",
            'md_webp' => "{$baseUrl}/{$directory}/{$filename}_md.webp",
            'lg_webp' => "{$baseUrl}/{$directory}/{$filename}_lg.webp",
            'xl_webp' => "{$baseUrl}/{$directory}/{$filename}_xl.webp",
        ];
    }
}
