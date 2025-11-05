<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
   protected function schedule(Schedule $schedule): void
{
    $schedule->command('users:send-inactivity-warning')->daily()->at('10:00');
    $schedule->command('users:deactivate-inactive', ['--notify'])->daily()->at('02:00');
}

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
