<?php

namespace App\Notifications;

use App\Models\Event;
use App\Models\Operation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventReminderNotification extends Notification
{
    use Queueable;

    protected $event;
    protected $operation;

    /**
     * Getter pour l'événement (utile pour les tests)
     */
    public function getEvent(): Event
    {
        return $this->event;
    }

    /**
     * Getter pour l'opération (utile pour les tests)
     */
    public function getOperation(): Operation
    {
        return $this->operation;
    }

    public function __construct(Event $event, Operation $operation)
    {
        $this->event = $event;
        $this->operation = $operation;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $eventDate = $this->event->start_date->format('d/m/Y à H:i');
        $eventName = $this->event->name;
        $quantity = $this->operation->quantity;
        $location = $this->event->localisation->address ?? 'Non spécifié';

        return (new MailMessage)
            ->subject("Rappel : {$eventName} dans 2 jours")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre événement approche ! Nous vous rappelons que **{$eventName}** aura lieu dans 2 jours.")
            ->line("📅 **Date :** {$eventDate}")
            ->line("📍 **Lieu :** {$location}")
            ->line("🎫 **Nombre de places :** {$quantity}")
            ->action('Voir les détails', env('FRONTEND_URL') . "/events/{$this->event->id}")
            ->line('Nous avons hâte de vous voir !')
            ->salutation('À bientôt, L\'équipe ' . config('app.name'));
    }
}