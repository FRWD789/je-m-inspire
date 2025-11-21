<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Event;

class NewEventNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $eventUrl = env("FRONTEND_URL") . '/events/' . $this->event->id;
        $proProfileUrl = env("FRONTEND_URL") . '/user/' . $this->event->creator->id;
        $myFollowingUrl = env("FRONTEND_URL") . '/dashboard/my-following';

        $greeting = 'Bonjour ' . $notifiable->name . ' ' . $notifiable->last_name . ',';

        return (new MailMessage)
            ->subject('🎉 Nouvel événement - ' . $this->event->creator->name . ' ' . $this->event->creator->last_name)
            ->view('emails.notifications.new-event', [
                'user' => $notifiable,
                'event' => $this->event,
                'pro' => $this->event->creator,
                'eventUrl' => $eventUrl,
                'proProfileUrl' => $proProfileUrl,
                'myFollowingUrl' => $myFollowingUrl,
                'greeting' => $greeting,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Nouvel événement publié',
            'event_id' => $this->event->id,
            'pro_id' => $this->event->creator->id,
            'created_at' => now(),
        ];
    }
}