<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordExpirationWarningNotification extends Notification
{
    use Queueable;

    private $daysRemaining;

    public function __construct($daysRemaining)
    {
        $this->daysRemaining = $daysRemaining;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $loginUrl = config('app.frontend_url') . '/login';

        return (new MailMessage)
            ->subject("Votre mot de passe expire dans {$this->daysRemaining} jours")
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line("Votre mot de passe expirera dans {$this->daysRemaining} jours.")
            ->line('Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe régulièrement.')
            ->line('Vous pouvez le faire dès maintenant en vous connectant à votre compte.')
            ->action('Changer mon mot de passe', $loginUrl)
            ->line('Si vous ne changez pas votre mot de passe avant son expiration, vous devrez le faire lors de votre prochaine connexion.')
            ->salutation('Cordialement, L\'équipe Je M\'inspire');
    }
}
