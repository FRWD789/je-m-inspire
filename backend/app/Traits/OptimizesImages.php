<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Trait OptimizesImages - VERSION CORRIGÉE
 *
 * ✅ Convertit TOUJOURS en JPG (même si PNG uploadé)
 * ✅ Génère TOUTES les variantes (sm, md, lg, xl)
 * ✅ Crée WebP pour chaque variante
 * ✅ Supprime le PNG temporaire
 */
trait OptimizesImages
{
    /**
     * Optimise et sauvegarde une image en plusieurs tailles + WebP
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $directory (ex: 'event_images', 'event_thumbnails')
     * @param int $maxWidth (max 1920px)
     * @param int $quality (1-100, recommandé: 85)
     * @return string Chemin relatif du JPG original (ex: 'event_images/123_abc.jpg')
     */
    public function optimizeAndSaveImage($file, $directory, $maxWidth = 1920, $quality = 85)
    {
        $baseFilename = time() . '_' . Str::random(10);
        $originalExtension = strtolower($file->getClientOriginalExtension());

        // ✅ ÉTAPE 1 : Sauvegarder temporairement (garder extension originale)
        $tempFilename = $baseFilename . '.' . $originalExtension;
        $tempPath = $file->storeAs($directory, $tempFilename, 'public');
        $tempFullPath = storage_path('app/public/' . $tempPath);

        // Augmenter limite mémoire
        $originalMemoryLimit = ini_get('memory_limit');
        ini_set('memory_limit', '1024M');

        try {
            // ✅ ÉTAPE 2 : Charger l'image
            $imageInfo = getimagesize($tempFullPath);
            if (!$imageInfo) {
                throw new \Exception("Impossible de lire l'image");
            }

            list($originalWidth, $originalHeight, $type) = $imageInfo;
            $source = $this->loadImage($tempFullPath, $type);

            if (!$source) {
                throw new \Exception("Impossible de charger l'image");
            }

            // ✅ ÉTAPE 3 : Sauvegarder l'ORIGINAL en JPG + WebP
            $originalJpgPath = storage_path("app/public/{$directory}/{$baseFilename}.jpg");
            $originalWebpPath = storage_path("app/public/{$directory}/{$baseFilename}.webp");

            // Redimensionner si nécessaire
            if ($originalWidth > $maxWidth) {
                $ratio = $maxWidth / $originalWidth;
                $newWidth = $maxWidth;
                $newHeight = (int)($originalHeight * $ratio);

                $resized = imagecreatetruecolor($newWidth, $newHeight);
                imagecopyresampled(
                    $resized, $source,
                    0, 0, 0, 0,
                    $newWidth, $newHeight,
                    $originalWidth, $originalHeight
                );

                imagejpeg($resized, $originalJpgPath, $quality);
                imagewebp($resized, $originalWebpPath, $quality);
                imagedestroy($resized);
            } else {
                // Image déjà assez petite, juste convertir
                imagejpeg($source, $originalJpgPath, $quality);
                imagewebp($source, $originalWebpPath, $quality);
            }

            // ✅ ÉTAPE 4 : Générer les variantes responsive
            $this->generateResponsiveVariants(
                $originalJpgPath,
                $directory,
                $baseFilename,
                $originalWidth,
                $originalHeight,
                $quality
            );

            // ✅ ÉTAPE 5 : Supprimer le fichier temporaire (PNG)
            if ($originalExtension !== 'jpg' && $originalExtension !== 'jpeg') {
                if (file_exists($tempFullPath)) {
                    unlink($tempFullPath);
                }
            }

            imagedestroy($source);
            gc_collect_cycles();

            Log::info('[OptimizeImage] Images générées avec succès', [
                'directory' => $directory,
                'basename' => $baseFilename,
                'original_size' => $originalWidth . 'x' . $originalHeight,
                'variants' => ['sm', 'md', 'lg', 'xl'],
                'formats' => ['jpg', 'webp']
            ]);

        } catch (\Exception $e) {
            Log::error('[OptimizeImage] Erreur: ' . $e->getMessage(), [
                'file' => $tempPath,
                'directory' => $directory
            ]);
            throw $e;
        } finally {
            ini_set('memory_limit', $originalMemoryLimit);
        }

        // ✅ RETOURNER le chemin du JPG (pas du PNG)
        return "{$directory}/{$baseFilename}.jpg";
    }

    /**
     * Génère TOUTES les variantes responsive (sm, md, lg, xl)
     */
    private function generateResponsiveVariants($originalJpgPath, $directory, $basename, $originalWidth, $originalHeight, $quality)
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
            // ✅ FIX : Générer MÊME si l'image est plus petite
            // Dans ce cas, on duplique l'image à sa taille réelle

            if ($originalWidth <= $targetWidth) {
                // Image trop petite : dupliquer sans redimensionner
                $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                // Copier l'original
                copy($originalJpgPath, $jpgPath);

                // Créer WebP
                $tempSource = imagecreatefromjpeg($originalJpgPath);
                imagewebp($tempSource, $webpPath, $quality);
                imagedestroy($tempSource);

                continue;
            }

            // Calculer nouvelles dimensions
            $ratio = $targetWidth / $originalWidth;
            $newWidth = $targetWidth;
            $newHeight = (int)($originalHeight * $ratio);

            // Créer image redimensionnée
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled(
                $resized, $source,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $originalWidth, $originalHeight
            );

            // Sauvegarder JPG
            $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
            imagejpeg($resized, $jpgPath, $quality);

            // Sauvegarder WebP
            $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");
            imagewebp($resized, $webpPath, $quality);

            imagedestroy($resized);
        }

        imagedestroy($source);
        gc_collect_cycles();
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
                $img = @imagecreatefrompng($filePath);
                if ($img) {
                    // Convertir fond transparent en blanc
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
     * Retourne les chemins relatifs de toutes les variantes
     *
     * @param string $originalPath (ex: 'event_images/123_abc.jpg')
     * @return array Chemins relatifs
     */
    public function getImageVariants($originalPath)
    {
        if (!$originalPath) {
            return [
                'original' => null,
                'sm' => null, 'md' => null, 'lg' => null, 'xl' => null,
                'sm_webp' => null, 'md_webp' => null, 'lg_webp' => null, 'xl_webp' => null,
            ];
        }

        $pathInfo = pathinfo($originalPath);
        $directory = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];

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
