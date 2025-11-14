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
    protected $daysUntil;

    public function getEvent(): Event
    {
        return $this->event;
    }

    public function getOperation(): Operation
    {
        return $this->operation;
    }

    public function __construct(Event $event, Operation $operation, int $daysUntil = 2)
    {
        $this->event = $event;
        $this->operation = $operation;
        $this->daysUntil = $daysUntil;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $eventUrl = config(env("FRONTEND_URL"), env("APP_URL")) . '/events/' . $this->event->id;

        $greeting = 'Bonjour ' . $notifiable->name . ',';

        return (new MailMessage)
            ->subject('⏰ Rappel : ' . $this->event->name . ' dans ' . $this->daysUntil . ' jour(s)')
            ->view('emails.notifications.event-reminder', [
                'user' => $notifiable,
                'event' => $this->event,
                'operation' => $this->operation,
                'daysUntil' => $this->daysUntil,
                'eventUrl' => $eventUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Rappel événement',
            'event_id' => $this->event->id,
            'days_until' => $this->daysUntil,
        ];
    }
}