<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\AccountDeactivatedNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DeactivateInactiveUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:deactivate-inactive
                            {--days=90 : Nombre de jours d\'inactivité}
                            {--dry-run : Simuler sans désactiver}
                            {--notify : Envoyer des notifications}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Désactive les utilisateurs inactifs depuis plus de X jours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $dryRun = $this->option('dry-run');
        $notify = $this->option('notify');

        $this->info("🔍 Recherche des utilisateurs inactifs depuis plus de {$days} jours...");

        // Récupérer les utilisateurs inactifs (exclure les admins)
        $inactiveUsers = User::where('is_active', true)
            ->where('last_login_at', '<', now()->subDays($days))
            ->whereDoesntHave('roles', function($query) {
                $query->where('role', 'admin');
            })
            ->get();

        if ($inactiveUsers->isEmpty()) {
            $this->info('✅ Aucun utilisateur inactif trouvé.');
            return Command::SUCCESS;
        }

        $this->warn("⚠️  {$inactiveUsers->count()} utilisateur(s) inactif(s) trouvé(s)");

        // Afficher les détails
        $this->table(
            ['ID', 'Email', 'Nom', 'Dernier login', 'Jours inactifs'],
            $inactiveUsers->map(function($user) {
                return [
                    $user->id,
                    $user->email,
                    $user->name . ' ' . $user->last_name,
                    $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i') : 'Jamais',
                    $user->last_login_at ? now()->diffInDays($user->last_login_at) : 'N/A'
                ];
            })
        );

        if ($dryRun) {
            $this->info('🧪 Mode simulation - Aucune modification effectuée');
            return Command::SUCCESS;
        }

        // Confirmation
        if (!$this->confirm('Voulez-vous vraiment désactiver ces utilisateurs ?', false)) {
            $this->info('❌ Opération annulée');
            return Command::FAILURE;
        }

        $deactivatedCount = 0;
        $errorCount = 0;

        // Désactiver les utilisateurs
        $this->withProgressBar($inactiveUsers, function($user) use ($notify, &$deactivatedCount, &$errorCount, $days) {
            try {
                // Simplement mettre is_active à false
                $user->is_active = false;
                $user->save();

                // Envoyer une notification si demandé
                if ($notify) {
                    try {
                        $user->notify(new AccountDeactivatedNotification($days));
                    } catch (\Exception $e) {
                        Log::error('[DeactivateInactive] Erreur notification', [
                            'user_id' => $user->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                Log::info('[DeactivateInactive] Utilisateur désactivé', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'last_login_at' => $user->last_login_at,
                    'days_inactive' => $days
                ]);

                $deactivatedCount++;

            } catch (\Exception $e) {
                Log::error('[DeactivateInactive] Erreur désactivation', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                $errorCount++;
            }
        });

        $this->newLine(2);
        $this->info("✅ {$deactivatedCount} utilisateur(s) désactivé(s)");

        if ($errorCount > 0) {
            $this->error("❌ {$errorCount} erreur(s) rencontrée(s)");
        }

        return Command::SUCCESS;
    }
}
