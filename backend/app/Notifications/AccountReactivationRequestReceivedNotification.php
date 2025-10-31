<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountReactivationRequestReceivedNotification extends Notification
{
    use Queueable;

    public $daysInactive;

    public function __construct(?int $daysInactive = null)
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

        return (new MailMessage)
            ->subject('📨 Demande de réactivation de compte reçue')
            ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
            ->line('Nous avons bien **reçu votre demande de réactivation** de compte.')
            ->line('---')
            ->line('**Informations de votre demande :**')
            ->line('📧 **Email :** ' . $notifiable->email)
            ->line('📅 **Date de demande :** ' . now()->locale('fr')->isoFormat('dddd D MMMM YYYY à HH:mm'))
            ->line('📊 **Statut actuel :** Compte désactivé')
            ->when($this->daysInactive, function($message) {
                return $message->line('⏱️ **Durée d\'inactivité :** ' . $this->daysInactive . ' jours');
            })
            ->line('---')
            ->line('**Prochaines étapes :**')
            ->line('• Notre équipe va examiner votre demande')
            ->line('• Le traitement prend généralement **24 à 48 heures ouvrables**')
            ->line('• Vous recevrez un email dès que votre compte sera réactivé')
            ->line('---')
            ->line('**Ce que nous vérifions :**')
            ->line('✓ L\'authenticité de votre demande')
            ->line('✓ La conformité de votre compte avec nos conditions d\'utilisation')
            ->line('✓ L\'historique de votre compte')
            ->line('---')
            ->line('**Informations importantes :**')
            ->line('⚠️ Votre compte reste désactivé pendant l\'examen')
            ->line('⚠️ Vous ne pouvez pas vous connecter tant que votre compte n\'est pas réactivé')
            ->line('✅ Toutes vos données sont conservées et seront restaurées après réactivation')
            ->line('---')
            ->line('**Besoin d\'aide ?**')
            ->line('Si vous avez des questions concernant votre demande ou si vous n\'êtes pas à l\'origine de cette demande, contactez-nous immédiatement :')
            ->line('📧 ' . $contactEmail)
            ->line('---')
            ->line('Nous vous remercions pour votre patience.')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Demande de réactivation de compte reçue',
            'requested_at' => now(),
            'days_inactive' => $this->daysInactive,
        ];
    }
}