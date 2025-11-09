<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivatedNotification extends Notification
{
    use Queueable;

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $loginUrl = env('FRONTEND_URL') . '/login';

        return (new MailMessage)
            ->subject('Votre compte a été réactivé avec succès')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Bonne nouvelle ! Votre compte a été réactivé avec succès.')
            ->line('Vous pouvez dès maintenant vous reconnecter et profiter à nouveau de tous nos services.')
            ->action('Se connecter', $loginUrl)
            ->line('Si vous n\'avez pas demandé cette réactivation, veuillez nous contacter immédiatement.')
            ->salutation('À bientôt, L\'équipe Je M\'inspire');
    }
}
