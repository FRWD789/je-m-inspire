<?php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\SendEventRemindersJob;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Backup tous les 2 jours à 2h du matin
        $schedule->command('backup:simple')
                ->days([1, 3, 5, 0]) // Lundi, Mercredi, Vendredi, Dimanche
                ->at('02:00');

        // Ou alternative plus simple (tous les 2 jours à partir d'aujourd'hui)
        $schedule->command('backup:simple')
                ->twiceWeekly(1, 4) // Lundi et Jeudi
                ->at('02:00');


        // Envoyer les rappels d'événements chaque jour à 9h00
        $schedule->job(new SendEventRemindersJob())
        ->dailyAt('09:00')
        ->name('send-event-reminders')
        ->withoutOverlapping()
        ->onOneServer()
        ->emailOutputOnFailure(env('ADMIN_EMAIL', 'admin@example.com'));

        // Alternative : Exécuter plusieurs fois par jour (toutes les 6h)
        // $schedule->job(new SendEventRemindersJob())
        //     ->everySixHours()
        //     ->name('send-event-reminders')
        //     ->withoutOverlapping();

        // Logs de debug (optionnel)
        if (config('app.debug')) {
            $schedule->call(function () {
                \Log::info('[Scheduler] Vérification des tâches planifiées', [
                    'time' => now()->toDateTimeString()
                ]);
            })->everyMinute();
        }
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
