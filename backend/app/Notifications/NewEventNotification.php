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
        $eventUrl = config('app.frontend_url') . '/events/' . $this->event->id;
        $proProfileUrl = config('app.frontend_url') . '/user/' . $this->event->creator->id;
        $myFollowingUrl = config('app.frontend_url') . '/dashboard/my-following';

        // Token sécurisé pour désactiver les notifications
        $token = hash_hmac('sha256',
            $notifiable->id . '-' . $this->event->creator->id,
            config('app.key')
        );
        $disableNotificationsUrl = config('app.frontend_url') . '/notifications/disable?' . http_build_query([
            'follower_id' => $notifiable->id,
            'pro_id' => $this->event->creator->id,
            'token' => $token
        ]);

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
                'disableNotificationsUrl' => $disableNotificationsUrl,
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
