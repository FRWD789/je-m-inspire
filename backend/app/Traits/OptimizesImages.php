<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait OptimizesImages
{
    public function optimizeAndSaveImage($file, $directory, $maxWidth = 1920, $quality = 85)
    {
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'public');
        $fullPath = storage_path('app/public/' . $path);

        // ✅ Augmenter temporairement la limite de mémoire
        $originalMemoryLimit = ini_get('memory_limit');
        ini_set('memory_limit', '1024M');

        try {
            $this->resizeImageGD($fullPath, $maxWidth, $quality);
        } finally {
            ini_set('memory_limit', $originalMemoryLimit);
        }

        return $path;
    }

    private function resizeImageGD($filePath, $maxWidth, $quality)
    {
        $imageInfo = getimagesize($filePath);
        if (!$imageInfo) return;

        list($width, $height, $type) = $imageInfo;

        // ✅ Si l'image est énorme (>4000px), la réduire d'abord à 2000px
        if ($width > 4000 || $height > 4000) {
            $this->resizeInSteps($filePath, $type, $width, $height, 2000, $quality);
            list($width, $height, $type) = getimagesize($filePath);
        }

        if ($width <= $maxWidth) return;

        $ratio = $maxWidth / $width;
        $newWidth = $maxWidth;
        $newHeight = (int)($height * $ratio);

        $source = $this->loadImage($filePath, $type);
        if (!$source) return;

        $destination = imagecreatetruecolor($newWidth, $newHeight);

        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
            imagealphablending($destination, false);
            imagesavealpha($destination, true);
            $transparent = imagecolorallocatealpha($destination, 0, 0, 0, 127);
            imagefill($destination, 0, 0, $transparent);
        }

        imagecopyresampled(
            $destination, $source,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $width, $height
        );

        $this->saveImage($destination, $filePath, $type, $quality);

        imagedestroy($source);
        imagedestroy($destination);
        gc_collect_cycles();
    }

    private function resizeInSteps($filePath, $type, $width, $height, $targetWidth, $quality)
    {
        $ratio = $targetWidth / $width;
        $newWidth = $targetWidth;
        $newHeight = (int)($height * $ratio);

        $source = $this->loadImage($filePath, $type);
        if (!$source) return;

        $destination = imagecreatetruecolor($newWidth, $newHeight);

        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
            imagealphablending($destination, false);
            imagesavealpha($destination, true);
            $transparent = imagecolorallocatealpha($destination, 0, 0, 0, 127);
            imagefill($destination, 0, 0, $transparent);
        }

        imagecopyresampled(
            $destination, $source,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $width, $height
        );

        $this->saveImage($destination, $filePath, $type, $quality);

        imagedestroy($source);
        imagedestroy($destination);
        gc_collect_cycles();
    }

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

    private function saveImage($image, $filePath, $type, $quality)
    {
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($image, $filePath, $quality);
                break;
            case IMAGETYPE_PNG:
                $pngQuality = (int)(9 - ($quality / 100 * 9));
                imagepng($image, $filePath, $pngQuality);
                break;
            case IMAGETYPE_GIF:
                imagegif($image, $filePath);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($image, $filePath, $quality);
                break;
        }
    }
}
