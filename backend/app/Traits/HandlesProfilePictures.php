<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

trait HandlesProfilePictures
{
    public function uploadProfilePicture($file, $userId = null)
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/avif'];

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception('Le fichier doit être une image valide.');
        }

        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('profile_pictures', $filename, 'public');

        Log::info('[Upload] Image profil uploadée', [
            'user_id' => $userId,
            'path' => $path
        ]);

        return $path;
    }

    public function deleteProfilePicture($path)
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
