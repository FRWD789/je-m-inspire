<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use ZipArchive;
use Carbon\Carbon;

class SimpleBackup extends Command
{
    protected $signature = 'backup:simple';
    protected $description = 'Simple backup without notifications';

    public function handle()
    {
        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$timestamp}.zip";
        $backupPath = storage_path("app/backups/{$filename}");

        if (!is_dir(dirname($backupPath))) {
            mkdir(dirname($backupPath), 0755, true);
        }

        $this->info('Création du backup...');

        $zip = new ZipArchive();
        if ($zip->open($backupPath, ZipArchive::CREATE) === TRUE) {

            $folders = ['app', 'config', 'database', 'public', 'resources', 'routes'];

            foreach ($folders as $folder) {
                $folderPath = base_path($folder);
                if (is_dir($folderPath)) {
                    $this->addFolderToZip($zip, $folderPath, $folder);
                    $this->info("✓ {$folder}/");
                }
            }

            $zip->close();
            $size = $this->formatBytes(filesize($backupPath));
            $this->info("Backup terminé: {$filename} ({$size})");

        } else {
            $this->error("Erreur création ZIP");
            return 1;
        }

        return 0;
    }

    private function addFolderToZip($zip, $folderPath, $zipPath)
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($folderPath)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $filePath = $file->getRealPath();
                $relativePath = $zipPath . '/' . substr($filePath, strlen($folderPath) + 1);
                $zip->addFile($filePath, str_replace('\\', '/', $relativePath));
            }
        }
    }

    private function formatBytes($size, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        return round($size, $precision) . ' ' . $units[$i];
    }
}
