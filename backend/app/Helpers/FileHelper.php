<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;

class FileHelper
{
    /**
     * Obtenir l'extension depuis le MIME type
     * Fallback sur getClientOriginalExtension() si disponible
     *
     * @param UploadedFile $file
     * @return string Extension sans le point (ex: 'jpg', 'png')
     */
    public static function getExtensionFromMimeType(UploadedFile $file): string
    {
        // 1. Essayer l'extension du nom de fichier original
        $clientExtension = $file->getClientOriginalExtension();
        if (!empty($clientExtension)) {
            return $clientExtension;
        }

        // 2. Fallback : détecter depuis MIME type
        $mimeType = $file->getMimeType();

        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/avif' => 'avif',
            'image/bmp' => 'bmp',
            'image/svg+xml' => 'svg',
            'image/tiff' => 'tiff',
            'image/x-icon' => 'ico',
        ];

        // Retourner l'extension correspondante ou 'jpg' par défaut
        return $mimeMap[$mimeType] ?? 'jpg';
    }
}
