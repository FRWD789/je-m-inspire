<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProfessionalApplicationConfirmationNotification extends Notification
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
        $loginUrl = config('app.frontend_url') . '/login';
        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        return (new MailMessage)
            ->subject('✅ Votre demande d\'inscription professionnelle a été reçue')
            ->greeting($greeting)
            ->line('Nous avons bien reçu votre demande d\'inscription en tant que professionnel sur Je m\'inspire.')
            ->line('Notre équipe va examiner votre candidature dans les plus brefs délais.')
            ->line('Vous recevrez un email de confirmation une fois votre compte approuvé.')
            ->action('Retour à l\'accueil', $loginUrl)
            ->line('Merci de votre intérêt pour notre plateforme !');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Demande d\'inscription reçue',
            'submitted_at' => now(),
        ];
    }
}
