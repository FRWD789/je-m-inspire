<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProfessionalRejectedNotification extends Notification
{
    use Queueable;

    public $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $reason)
    {
        $this->reason = $reason;
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
        $registerUrl = config('app.frontend_url', 'http://localhost:5173') . '/register-professional';
        $contactEmail = config('mail.from.address', 'support@example.com');

        return (new MailMessage)
            ->subject('❌ Votre demande d\'inscription professionnel')
            ->greeting('Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',')
            ->line('Nous avons examiné votre demande d\'inscription en tant que professionnel sur notre plateforme.')
            ->line('Malheureusement, nous ne pouvons pas approuver votre demande pour le moment.')
            ->line('**Raison du refus :**')
            ->line('> ' . $this->reason)
            ->line('---')
            ->line('**Que pouvez-vous faire ?**')
            ->line('• Si vous pensez qu\'il s\'agit d\'une erreur, contactez-nous à : ' . $contactEmail)
            ->line('• Vous pouvez soumettre une nouvelle demande en corrigeant les points mentionnés')
            ->line('• Assurez-vous de bien répondre aux critères requis dans votre lettre de motivation')
            ->line('---')
            ->line('**Note importante :** Votre compte a été supprimé de notre système. Vous devrez créer un nouveau compte si vous souhaitez soumettre une nouvelle demande.')
            ->action('Soumettre une nouvelle demande', $registerUrl)
            ->line('Nous vous remercions de votre intérêt pour notre plateforme.')
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
            'message' => 'Votre demande d\'inscription a été rejetée',
            'reason' => $this->reason,
            'rejected_at' => now(),
        ];
    }
}
