<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\SendEventRemindersJob;

// Commande d'inspiration (existante)
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ✅ TÂCHES PLANIFIÉES
Schedule::command('backup:simple')
    ->twiceWeekly(1, 4) // Lundi et Jeudi
    ->at('02:00')
    ->appendOutputTo(storage_path('logs/backup.log'));

Schedule::job(new SendEventRemindersJob())
    ->dailyAt('09:00')
    ->name('send-event-reminders')
    ->withoutOverlapping()
    ->onOneServer()
    ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@jeminspire.com'));

// Logs de debug (optionnel)
if (config('app.debug')) {
    Schedule::call(function () {
        \Log::info('[Scheduler] Vérification des tâches planifiées', [
            'time' => now()->toDateTimeString()
        ]);
    })->everyMinute();
}
