<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\InactivityWarningNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SendInactivityWarning extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:send-inactivity-warning
                            {--days=83 : Nombre de jours d\'inactivité avant l\'avertissement}
                            {--dry-run : Simuler sans envoyer}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envoie un avertissement aux utilisateurs inactifs avant désactivation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $dryRun = $this->option('dry-run');
        $daysUntilDeactivation = 90 - $days;

        $this->info("🔍 Recherche des utilisateurs inactifs depuis {$days} jours...");

        // Récupérer les utilisateurs inactifs
        $usersToWarn = User::where('is_active', true)
            ->where('last_login_at', '<', now()->subDays($days))
            ->whereDoesntHave('roles', function($query) {
                $query->where('role', 'admin');
            })
            ->get();

        // Filtrer ceux qui n'ont pas déjà été avertis (via Cache)
        $usersToWarn = $usersToWarn->filter(function($user) {
            $cacheKey = "inactivity_warning_sent:{$user->id}";
            return !Cache::has($cacheKey);
        });

        if ($usersToWarn->isEmpty()) {
            $this->info('✅ Aucun utilisateur à avertir.');
            return Command::SUCCESS;
        }

        $this->warn("⚠️  {$usersToWarn->count()} utilisateur(s) à avertir");

        $this->table(
            ['ID', 'Email', 'Nom', 'Dernier login', 'Jours restants'],
            $usersToWarn->map(function($user) use ($daysUntilDeactivation) {
                return [
                    $user->id,
                    $user->email,
                    $user->name . ' ' . $user->last_name,
                    $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i') : 'Jamais',
                    $daysUntilDeactivation
                ];
            })
        );

        if ($dryRun) {
            $this->info('🧪 Mode simulation - Aucune notification envoyée');
            return Command::SUCCESS;
        }

        $sentCount = 0;
        $errorCount = 0;

        $this->withProgressBar($usersToWarn, function($user) use ($daysUntilDeactivation, &$sentCount, &$errorCount) {
            try {
                // Envoyer la notification
                $user->notify(new InactivityWarningNotification($daysUntilDeactivation));

                // Stocker dans le cache pour éviter d'envoyer plusieurs fois
                // Durée : jusqu'à la désactivation potentielle (7 jours + marge)
                $cacheKey = "inactivity_warning_sent:{$user->id}";
                Cache::put($cacheKey, true, now()->addDays(10));

                Log::info('[InactivityWarning] Avertissement envoyé', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'last_login_at' => $user->last_login_at,
                    'days_until_deactivation' => $daysUntilDeactivation
                ]);

                $sentCount++;

            } catch (\Exception $e) {
                Log::error('[InactivityWarning] Erreur envoi notification', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                $errorCount++;
            }
        });

        $this->newLine(2);
        $this->info("✅ {$sentCount} avertissement(s) envoyé(s)");

        if ($errorCount > 0) {
            $this->error("❌ {$errorCount} erreur(s) rencontrée(s)");
        }

        return Command::SUCCESS;
    }
}
