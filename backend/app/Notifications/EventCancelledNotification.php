<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Event;

class EventCancelledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $event;
    public $refundsList;

    public function __construct(Event $event, array $refundsList)
    {
        $this->event = $event;
        $this->refundsList = $refundsList;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $eventUrl = env("FRONTEND_URL") . '/events/' . $this->event->id;
        $myEventsUrl = env("FRONTEND_URL") . '/dashboard/my-events';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        // Calculer le total des remboursements
        $totalRefunds = array_sum(array_column($this->refundsList, 'montant'));

        return (new MailMessage)
            ->subject('⚠️ Annulation événement - ' . $this->event->name)
            ->view('emails.notifications.event-cancelled', [
                'user' => $notifiable,
                'event' => $this->event,
                'refundsList' => $this->refundsList,
                'totalRefunds' => $totalRefunds,
                'participantsCount' => count($this->refundsList),
                'eventUrl' => $eventUrl,
                'myEventsUrl' => $myEventsUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Événement annulé',
            'event_id' => $this->event->id,
            'refunds_count' => count($this->refundsList),
            'created_at' => now(),
        ];
    }
}
