<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Trait OptimizesImages - VERSION CORRIGÉE (Sans padding noir)
 *
 * ✅ Préserve TOUJOURS l'aspect ratio original
 * ✅ Ne ajoute JAMAIS de padding noir
 * ✅ Génère TOUTES les variantes (sm, md, lg, xl)
 * ✅ Crée WebP pour chaque variante
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

        // ÉTAPE 1 : Sauvegarder temporairement
        $tempFilename = $baseFilename . '.' . $originalExtension;
        $tempPath = $file->storeAs($directory, $tempFilename, 'public');
        $tempFullPath = storage_path('app/public/' . $tempPath);

        // Augmenter limite mémoire
        $originalMemoryLimit = ini_get('memory_limit');
        ini_set('memory_limit', '1024M');

        try {
            // ÉTAPE 2 : Charger l'image
            $imageInfo = getimagesize($tempFullPath);
            if (!$imageInfo) {
                throw new \Exception("Impossible de lire l'image");
            }

            list($originalWidth, $originalHeight, $type) = $imageInfo;
            $source = $this->loadImage($tempFullPath, $type);

            if (!$source) {
                throw new \Exception("Impossible de charger l'image");
            }

            // ÉTAPE 3 : Sauvegarder l'ORIGINAL en JPG + WebP
            $originalJpgPath = storage_path("app/public/{$directory}/{$baseFilename}.jpg");
            $originalWebpPath = storage_path("app/public/{$directory}/{$baseFilename}.webp");

            // ✅ CORRECTION : Préserver l'aspect ratio, ne PAS forcer carré
            if ($originalWidth > $maxWidth || $originalHeight > $maxWidth) {
                // Calculer les nouvelles dimensions EN PRÉSERVANT L'ASPECT RATIO
                $ratio = min($maxWidth / $originalWidth, $maxWidth / $originalHeight);
                $newWidth = (int)($originalWidth * $ratio);
                $newHeight = (int)($originalHeight * $ratio);

                $resized = imagecreatetruecolor($newWidth, $newHeight);

                // ✅ Fond blanc (au cas où il y aurait de la transparence)
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
            } else {
                // Image déjà assez petite, juste convertir SANS REDIMENSIONNER
                $newImg = imagecreatetruecolor($originalWidth, $originalHeight);
                $white = imagecolorallocate($newImg, 255, 255, 255);
                imagefill($newImg, 0, 0, $white);
                imagecopy($newImg, $source, 0, 0, 0, 0, $originalWidth, $originalHeight);

                imagejpeg($newImg, $originalJpgPath, $quality);
                imagewebp($newImg, $originalWebpPath, $quality);
                imagedestroy($newImg);
            }

            // ÉTAPE 4 : Générer les variantes responsive
            $this->generateResponsiveVariants(
                $originalJpgPath,
                $directory,
                $baseFilename,
                $originalWidth,
                $originalHeight,
                $quality
            );

            // ÉTAPE 5 : Supprimer le fichier temporaire
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

        return "{$directory}/{$baseFilename}.jpg";
    }

    /**
     * Génère TOUTES les variantes responsive EN PRÉSERVANT L'ASPECT RATIO
     * ✅ CORRECTION : Ne jamais ajouter de padding noir
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
            // Si l'image est plus petite que la cible, dupliquer sans redimensionner
            if ($originalWidth <= $targetWidth && $originalHeight <= $targetWidth) {
                $jpgPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.jpg");
                $webpPath = storage_path("app/public/{$directory}/{$basename}_{$sizeKey}.webp");

                copy($originalJpgPath, $jpgPath);

                $tempSource = imagecreatefromjpeg($originalJpgPath);
                imagewebp($tempSource, $webpPath, $quality);
                imagedestroy($tempSource);

                continue;
            }

            // ✅ CORRECTION : Calculer dimensions EN PRÉSERVANT L'ASPECT RATIO
            // Ne PAS forcer à être carré !
            $ratio = min($targetWidth / $originalWidth, $targetWidth / $originalHeight);
            $newWidth = (int)($originalWidth * $ratio);
            $newHeight = (int)($originalHeight * $ratio);

            // ✅ Créer image aux dimensions CALCULÉES (pas forcément carrée)
            $resized = imagecreatetruecolor($newWidth, $newHeight);

            // Fond blanc au cas où
            $white = imagecolorallocate($resized, 255, 255, 255);
            imagefill($resized, 0, 0, $white);

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
}
