<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class ProfessionalApplicationReceivedNotification extends Notification
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
        $contactEmail = config('mail.from.address', 'support@example.com');

        return (new MailMessage)
            ->subject('📨 Demande d\'inscription professionnel reçue')
            ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
            ->line('Nous avons bien **reçu votre demande d\'inscription** en tant que professionnel sur notre plateforme.')
            ->line('Merci de votre intérêt pour rejoindre notre communauté de professionnels !')
            ->line('---')
            ->line('**Informations de votre demande :**')
            ->line('📧 **Email :** ' . $notifiable->email)
            ->line('📅 **Date de soumission :** ' . now()->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm'))
            ->line('📊 **Statut :** En attente d\'examen')
            ->line('---')
            ->line('**Prochaines étapes :**')
            ->line('• Notre équipe va examiner votre demande et votre lettre de motivation')
            ->line('• L\'examen prend généralement **48 à 72 heures ouvrables**')
            ->line('• Vous recevrez un email dès qu\'une décision sera prise')
            ->line('---')
            ->line('**Ce que nous examinons :**')
            ->line('✓ La qualité et la pertinence de votre lettre de motivation')
            ->line('✓ Votre expérience dans le domaine du bien-être')
            ->line('✓ Votre projet professionnel sur notre plateforme')
            ->line('✓ La complétude de votre profil')
            ->line('---')
            ->line('**En attendant la validation :**')
            ->line('⚠️ Votre compte est temporairement en attente')
            ->line('⚠️ Vous ne pouvez pas encore créer d\'événements')
            ->line('✅ Vous recevrez un email dès que votre compte sera approuvé')
            ->line('---')
            ->line('**Besoin d\'aide ?**')
            ->line('Si vous avez des questions concernant votre demande, n\'hésitez pas à nous contacter :')
            ->line('📧 ' . $contactEmail)
            ->line('---')
            ->line('Nous vous remercions pour votre patience et sommes impatients de vous accueillir parmi nos professionnels !')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Demande d\'inscription professionnel reçue',
            'submitted_at' => now(),
            'status' => 'pending',
        ];
    }
}