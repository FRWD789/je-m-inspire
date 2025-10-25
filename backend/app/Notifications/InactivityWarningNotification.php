<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InactivityWarningNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $daysUntilDeactivation;

    public function __construct($daysUntilDeactivation)
    {
        $this->daysUntilDeactivation = $daysUntilDeactivation;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $loginUrl = config('app.url') . '/login';

        return (new MailMessage)
            ->subject("⚠️ Votre compte {$appName} sera bientôt désactivé")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Nous avons remarqué que vous n'avez pas utilisé votre compte depuis un moment.")
            ->line("**Votre compte sera automatiquement désactivé dans {$this->daysUntilDeactivation} jours** si vous ne vous connectez pas.")
            ->line("Pour garder votre compte actif, il vous suffit de vous connecter.")
            ->action('Se connecter maintenant', $loginUrl)
            ->line("Merci de faire partie de notre communauté !")
            ->salutation("Cordialement,\nL'équipe {$appName}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'inactivity_warning',
            'days_until_deactivation' => $this->daysUntilDeactivation,
        ];
    }
}
