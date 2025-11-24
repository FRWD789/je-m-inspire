<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\SendEventRemindersJob;

// ═══════════════════════════════════════════════════════════════
// COMMANDES ARTISAN
// ═══════════════════════════════════════════════════════════════

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ═══════════════════════════════════════════════════════════════
// TÂCHES PLANIFIÉES
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// 🗄️ BACKUP DE L'APPLICATION
// ───────────────────────────────────────────────────────────────
// Backup complet tous les lundis (1) et jeudis (4) à 2h du matin
Schedule::command('backup:simple')
    ->cron('0 2 * * 1,4')
    ->appendOutputTo(storage_path('logs/backup.log'))
    ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@jeminspire.com'));

// ───────────────────────────────────────────────────────────────
// 📧 RAPPELS D'ÉVÉNEMENTS
// ───────────────────────────────────────────────────────────────
// Envoyer les rappels d'événements chaque jour à 9h
Schedule::job(new SendEventRemindersJob())
    ->dailyAt('09:00')
    ->name('send-event-reminders')
    ->withoutOverlapping()
    ->onOneServer()
    ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@jeminspire.com'));

// ───────────────────────────────────────────────────────────────
// 🔐 GESTION DE L'EXPIRATION DES MOTS DE PASSE
// ───────────────────────────────────────────────────────────────

// Notification à J-7 (7 jours avant expiration) - Chaque jour à 7h
Schedule::command('password:notify-expiration --days-before=7')
    ->dailyAt('07:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/password-expiration.log'))
    ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@jeminspire.com'));

// Notification urgente à J-1 (1 jour avant expiration) - Chaque jour à 7h30
Schedule::command('password:notify-expiration --days-before=1')
    ->dailyAt('07:30')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/password-expiration.log'))
    ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@jeminspire.com'));

// ───────────────────────────────────────────────────────────────
// ⚠️ GESTION DE L'INACTIVITÉ DES UTILISATEURS
// ───────────────────────────────────────────────────────────────

// Avertissement aux utilisateurs inactifs (83 jours) - Chaque jour à 8h
Schedule::command('users:send-inactivity-warning')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/inactivity-warnings.log'))
    ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@jeminspire.com'));

// Désactivation des utilisateurs inactifs (90 jours) - Chaque jour à 22h
Schedule::command('users:deactivate-inactive --notify')
    ->dailyAt('22:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/deactivations.log'))
    ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@jeminspire.com'));

// ───────────────────────────────────────────────────────────────
// 🐛 DEBUG (Optionnel - Mode développement uniquement)
// ───────────────────────────────────────────────────────────────
if (config('app.debug')) {
    Schedule::call(function () {
        \Log::info('[Scheduler] Vérification des tâches planifiées', [
            'time' => now()->toDateTimeString()
        ]);
    })->everyMinute();
}
