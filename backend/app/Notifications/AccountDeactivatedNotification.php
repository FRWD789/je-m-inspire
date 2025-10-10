<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeactivatedNotification extends Notification
{
    use Queueable;

    public $daysInactive;

    public function __construct(int $daysInactive)
    {
        $this->daysInactive = $daysInactive;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $contactEmail = config('mail.from.address', 'support@example.com');
        $loginUrl = config('app.frontend_url', 'http://localhost:5173') . '/login';

        return (new MailMessage)
            ->subject('⚠️ Votre compte a été désactivé pour inactivité')
            ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
            ->line('Nous vous informons que votre compte a été **désactivé** en raison d\'une inactivité prolongée.')
            ->line('**Détails :**')
            ->line('• Dernière connexion : ' . $notifiable->last_login_at->format('d/m/Y à H:i'))
            ->line('• Durée d\'inactivité : ' . $this->daysInactive . ' jours')
            ->line('• Seuil de désactivation : 90 jours')
            ->line('---')
            ->line('**Comment réactiver votre compte ?**')
            ->line('Pour réactiver votre compte, veuillez nous contacter à : **' . $contactEmail . '**')
            ->line('Notre équipe traitera votre demande dans les plus brefs délais.')
            ->line('---')
            ->line('Si vous ne souhaitez plus utiliser notre plateforme, aucune action n\'est requise.')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Compte désactivé pour inactivité',
            'days_inactive' => $this->daysInactive,
            'deactivated_at' => now(),
        ];
    }
}
