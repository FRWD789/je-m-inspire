<?php



namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Backup tous les 2 jours à 2h du matin
        $schedule->command('backup:simple')
                ->days([1, 3, 5, 0]) // Lundi, Mercredi, Vendredi, Dimanche
                ->at('02:00');

        // Ou alternative plus simple (tous les 2 jours à partir d'aujourd'hui)
        $schedule->command('backup:simple')
             ->twiceWeekly(1, 4) // Lundi et Jeudi
             ->at('02:00');
        // Envoyer des avertissements tous les jours à 10h
        $schedule->command('users:send-inactivity-warning')
            ->daily()
            ->at('10:00')
            ->timezone('America/Toronto');

        // Désactiver les comptes inactifs tous les jours à 2h
        $schedule->command('users:deactivate-inactive --notify')
            ->daily()
            ->at('02:00')
            ->timezone('America/Toronto');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
