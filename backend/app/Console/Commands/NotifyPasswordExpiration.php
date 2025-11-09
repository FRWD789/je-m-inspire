<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\PasswordExpirationWarningNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class NotifyPasswordExpiration extends Command
{
    protected $signature = 'password:notify-expiration
                            {--days-before=7 : Notifier X jours avant expiration}
                            {--dry-run : Simuler sans envoyer}';

    protected $description = 'Notifier les utilisateurs dont le mot de passe expire bientôt';

    const PASSWORD_EXPIRATION_DAYS = 90;

    public function handle()
    {
        $daysBefore = $this->option('days-before');
        $dryRun = $this->option('dry-run');

        // Calculer le nombre de jours depuis la création qui déclenche l'alerte
        $targetDays = self::PASSWORD_EXPIRATION_DAYS - $daysBefore;

        $this->info("🔍 Recherche des utilisateurs à {$daysBefore} jours de l'expiration...");

        // Récupérer les utilisateurs dont le compte a exactement $targetDays jours
        $usersToNotify = User::whereDate('created_at', '=', now()->subDays($targetDays))
            ->where('is_active', true)
            ->whereDoesntHave('roles', function($query) {
                $query->where('role', 'admin');
            })
            ->get();

        if ($usersToNotify->isEmpty()) {
            $this->info('✅ Aucun utilisateur à notifier.');
            return Command::SUCCESS;
        }

        $this->warn("⚠️  {$usersToNotify->count()} utilisateur(s) à notifier");

        $this->table(
            ['ID', 'Email', 'Nom', 'Compte créé le', 'Jours restants'],
            $usersToNotify->map(function($user) use ($daysBefore) {
                return [
                    $user->id,
                    $user->email,
                    $user->name . ' ' . $user->last_name,
                    $user->created_at->format('Y-m-d'),
                    $daysBefore
                ];
            })
        );

        if ($dryRun) {
            $this->info('🧪 Mode simulation - Aucune notification envoyée');
            return Command::SUCCESS;
        }

        $sentCount = 0;
        $errorCount = 0;

        $this->withProgressBar($usersToNotify, function($user) use ($daysBefore, &$sentCount, &$errorCount) {
            try {
                $user->notify(new PasswordExpirationWarningNotification($daysBefore));

                Log::info('[PasswordExpiration] Notification envoyée', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'days_before_expiration' => $daysBefore
                ]);

                $sentCount++;

            } catch (\Exception $e) {
                Log::error('[PasswordExpiration] Erreur notification', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
                $errorCount++;
            }
        });

        $this->newLine(2);
        $this->info("✅ {$sentCount} notification(s) envoyée(s)");

        if ($errorCount > 0) {
            $this->error("❌ {$errorCount} erreur(s) rencontrée(s)");
        }

        return Command::SUCCESS;
    }
}
