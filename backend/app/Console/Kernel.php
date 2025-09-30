<?php
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
}
