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
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, OptimizesImages;

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
                    'path' => $pathInfo['temp_path'],
                    'error' => $e->getMessage()
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
        $imageId = $pathInfo['image_id'] ?? null;
        $field = $pathInfo['field'] ?? null; // 'thumbnail', 'banner', ou null pour images

        $fullPath = storage_path('app/public/' . $tempPath);

        if (!file_exists($fullPath)) {
            Log::warning('[OptimizeJob] Fichier introuvable', ['path' => $tempPath]);
            return;
        }

        // Créer un UploadedFile virtuel
        $fakeFile = new \Illuminate\Http\UploadedFile(
            $fullPath,
            basename($fullPath),
            mime_content_type($fullPath),
            null,
            true
        );

        // Optimiser
        $optimizedPath = $this->optimizeAndSaveImage(
            $fakeFile,
            $directory,
            $pathInfo['max_width'] ?? 1200,
            $pathInfo['quality'] ?? 85
        );

        // Mettre à jour en DB
        if ($imageId) {
            EventImage::where('id', $imageId)->update(['image_path' => $optimizedPath]);
        } elseif ($field) {
            Event::where('id', $this->eventId)->update([$field . '_path' => $optimizedPath]);
        }

        // Supprimer le fichier temporaire
        if (file_exists($fullPath) && $tempPath !== $optimizedPath) {
            unlink($fullPath);
        }
    }
}
