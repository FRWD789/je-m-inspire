<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class AccountDeactivatedNotification extends Notification
{
    use Queueable;

    private $daysInactive;

    public function __construct($daysInactive)
    {
        $this->daysInactive = $daysInactive;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Générer un lien signé sécurisé valide 30 jours
        $reactivationUrl = URL::temporarySignedRoute(
            'account.reactivate',
            now()->addDays(30),
            ['user' => $notifiable->id]
        );

        return (new MailMessage)
            ->subject('Votre compte a été désactivé')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line("Votre compte a été désactivé en raison d'une inactivité de {$this->daysInactive} jours.")
            ->line('Si vous souhaitez continuer à utiliser notre plateforme, vous pouvez réactiver votre compte en cliquant sur le bouton ci-dessous.')
            ->action('Réactiver mon compte', $reactivationUrl)
            ->line('Ce lien est valide pendant 30 jours.')
            ->line('Si vous ne souhaitez pas réactiver votre compte, ignorez simplement cet email.')
            ->salutation('Cordialement, L\'équipe Je M\'inspire');
    }
}
