<?php

namespace App\Notifications;

use Illuminate\Support\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    protected function verificationUrl($notifiable)
    {
        $expiration = Carbon::now()->addMinutes(60); // link valid 60 mins
        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            $expiration,
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->email)]
        );

        $query = parse_url($signedUrl, PHP_URL_QUERY);
        $frontendUrl = config('app.frontend_url')
            . '/verify-email?id=' . $notifiable->getKey()
            . '&hash=' . sha1($notifiable->email)
            . '&' . $query;

        return $frontendUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        // ✅ Vérifier si c'est un professionnel approuvé
        $isProfessional = $notifiable->roles()->where('role', 'professionnel')->exists();

        if ($isProfessional && $notifiable->is_approved) {
            return (new MailMessage)
                ->subject('🎉 Félicitations ! Votre compte professionnel a été approuvé')
                ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
                ->line('Excellente nouvelle ! Votre demande d\'inscription en tant que professionnel a été **approuvée** par notre équipe.')
                ->line('Pour finaliser l\'activation de votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :')
                ->action('Vérifier mon email', $url)
                ->line('Ce lien est valide pendant 60 minutes.')
                ->line('**Prochaines étapes après vérification :**')
                ->line('• Vous pourrez vous connecter à votre compte')
                ->line('• Compléter votre profil professionnel')
                ->line('• Commencer à créer et gérer vos événements')
                ->line('Si vous n\'avez pas créé de compte, aucune action n\'est requise.')
                ->salutation('Bienvenue dans notre communauté ! L\'équipe ' . config('app.name'));
        }

        // Email de vérification standard
        return (new MailMessage)
            ->subject('Vérifiez votre adresse email')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Merci de vous être inscrit sur notre plateforme !')
            ->line('Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.')
            ->action('Vérifier mon email', $url)
            ->line('Ce lien est valide pendant 60 minutes.')
            ->line('Si vous n\'avez pas créé de compte, aucune action n\'est requise.')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Vérification email requise',
            'email' => $notifiable->email
        ];
    }
}
