<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Trait OptimizesImages - VERSION FINALE CORRIGÉE
 *
 * Génère PLUSIEURS tailles d'images + conversion WebP automatique
 */
trait OptimizesImages
{
    /**
     * Optimise et sauvegarde une image en plusieurs tailles + WebP
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

        return $tempPath;
    }

    /**
     * Génère toutes les tailles responsive + WebP
     */
    private function generateResponsiveImages($originalPath, $directory, $basename, $quality)
    {
        $imageInfo = getimagesize($originalPath);
        if (!$imageInfo) return;

        list($originalWidth, $originalHeight, $type) = $imageInfo;

        // Définir les tailles à générer
        $sizes = [
            'sm' => 300,
            'md' => 600,
            'lg' => 1200,
            'xl' => 1920
        ];

        foreach ($sizes as $sizeKey => $targetWidth) {
            if ($originalWidth <= $targetWidth) {
                continue;
            }

            $ratio = $targetWidth / $originalWidth;
            $newWidth = $targetWidth;
            $newHeight = (int)($originalHeight * $ratio);

            $source = $this->loadImage($originalPath, $type);
            if (!$source) continue;

            $resized = imagecreatetruecolor($newWidth, $newHeight);

            if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
                $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
                imagefill($resized, 0, 0, $transparent);
            }

            imagecopyresampled(
                $resized, $source,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $originalWidth, $originalHeight
            );

            // Sauvegarder en JPEG
            $resizedPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
            imagejpeg($resized, $resizedPath, $quality);

            // Sauvegarder en WebP
            $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");
            imagewebp($resized, $webpPath, $quality);

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
     * ✅ CORRIGÉ : Retourne des CHEMINS RELATIFS, pas des URLs complètes
     * ResponsiveImage.tsx construira les URLs
     *
     * @param string $originalPath Chemin original (ex: 'event_images/123_abc.jpg')
     * @return array Chemins relatifs de toutes les variantes
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

        // ✅ RETOURNE DES CHEMINS RELATIFS UNIQUEMENT
        return [
            'original' => $originalPath,
            'sm' => "{$directory}/{$filename}_sm.jpg",
            'md' => "{$directory}/{$filename}_md.jpg",
            'lg' => "{$directory}/{$filename}_lg.jpg",
            'xl' => "{$directory}/{$filename}_xl.jpg",
            'sm_webp' => "{$directory}/{$filename}_sm.webp",
            'md_webp' => "{$directory}/{$filename}_md.webp",
            'lg_webp' => "{$directory}/{$filename}_lg.webp",
            'xl_webp' => "{$directory}/{$filename}_xl.webp",
        ];
    }
}
