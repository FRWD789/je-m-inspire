<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProfessionalApprovedNotification extends Notification
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl = config('app.frontend_url', 'http://localhost:5173') . '/login';

        return (new MailMessage)
            ->subject('✅ Votre compte professionnel a été approuvé !')
            ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
            ->line('Nous avons le plaisir de vous informer que votre demande d\'inscription en tant que professionnel a été **approuvée** ! 🎉')
            ->line('Vous pouvez maintenant vous connecter à votre compte et commencer à créer vos événements.')
            ->action('Se connecter maintenant', $loginUrl)
            ->line('**Prochaines étapes :**')
            ->line('• Connectez-vous à votre compte avec vos identifiants')
            ->line('• Complétez votre profil professionnel')
            ->line('• Commencez à créer vos événements')
            ->line('Si vous avez des questions, n\'hésitez pas à nous contacter.')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Votre compte professionnel a été approuvé',
            'approved_at' => now(),
        ];
    }
}
