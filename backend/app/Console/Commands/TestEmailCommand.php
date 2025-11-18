<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TestEmailCommand extends Command
{
    protected $signature = 'email:test {email? : Email de destination}';
    protected $description = 'Tester la configuration email';

    public function handle()
    {
        $email = $this->argument('email') ?? env('MAIL_FROM_ADDRESS');

        if (!$email) {
            $this->error('❌ Aucun email fourni. Utilisation : php artisan email:test votremail@example.com');
            return 1;
        }

        $this->info("📧 Envoi d'un email de test à : {$email}");
        $this->line('');

        // Afficher la config actuelle
        $this->info('🔧 Configuration SMTP actuelle :');
        $this->table(
            ['Paramètre', 'Valeur'],
            [
                ['MAIL_MAILER', config('mail.default')],
                ['MAIL_HOST', config('mail.mailers.smtp.host')],
                ['MAIL_PORT', config('mail.mailers.smtp.port')],
                ['MAIL_USERNAME', config('mail.mailers.smtp.username')],
                ['MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption')],
                ['MAIL_FROM_ADDRESS', config('mail.from.address')],
                ['MAIL_FROM_NAME', config('mail.from.name')],
            ]
        );

        $this->line('');
        $this->info('⏳ Envoi en cours...');

        try {
            Mail::raw('Ceci est un email de test envoyé depuis Laravel. Si vous recevez ceci, votre configuration fonctionne ! 🎉', function ($message) use ($email) {
                $message->to($email)
                    ->subject('✅ Test de configuration email - ' . config('app.name'));
            });

            $this->line('');
            $this->info('✅ Email envoyé avec succès !');
            $this->line('');
            $this->line('📬 Vérifiez votre boîte mail (spam inclus).');

            Log::info('[Email Test] Email de test envoyé avec succès', [
                'to' => $email,
                'mailer' => config('mail.default')
            ]);

            return 0;

        } catch (\Exception $e) {
            $this->line('');
            $this->error('❌ Erreur lors de l\'envoi :');
            $this->error($e->getMessage());
            $this->line('');

            Log::error('[Email Test] Erreur envoi email de test', [
                'to' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->warn('💡 Solutions possibles :');
            $this->line('1. Vérifier les credentials SMTP dans .env');
            $this->line('2. Gmail : Créer un mot de passe d\'application');
            $this->line('3. Utiliser Mailtrap pour le dev : https://mailtrap.io');
            $this->line('4. Vider le cache : php artisan config:clear');

            return 1;
        }
    }
}